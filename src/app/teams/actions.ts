'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createTeam(teamName: string, isPrivate: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
  }

  // Check if user is already in a team
  const { data: existingMember, error: memberCheckError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single();

  if (memberCheckError && memberCheckError.code !== 'PGRST116') {
    return { error: 'দলের সদস্যপদ যাচাই করা যায়নি।' };
  }
  if (existingMember) {
    return { error: 'আপনি ইতিমধ্যে একটি দলে আছেন।' };
  }

  const { data: team, error: insertError } = await supabase
    .from('teams')
    .insert({ name: teamName, created_by: user.id, is_private: isPrivate })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating team:', insertError);
    if (insertError.code === '23505') {
      return { error: 'এই নামে ইতিমধ্যে একটি দল আছে।' };
    }
    return { error: 'দল তৈরি করা যায়নি।' };
  }

  // Creator becomes the first member and admin
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: user.id, role: 'admin' });

  if (memberError) {
    console.error('Error adding creator to team:', memberError);
    // Attempt to delete the created team if adding the member fails
    await supabase.from('teams').delete().eq('id', team.id);
    return { error: 'দলে সদস্য যোগ করা যায়নি।' };
  }

  revalidatePath('/teams');
  return { success: true, team };
}

export async function joinTeam(teamId: string, token: string | null) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
  }

  const { error } = await supabase.rpc('join_team_with_token', {
    p_team_id: teamId,
    p_user_id: user.id,
    p_join_token: token,
  });

  if (error) {
    console.error('Error joining team:', error);
    if (error.message.includes('user_already_in_team')) {
      return { error: 'আপনি ইতিমধ্যে একটি দলে আছেন।' };
    }
    if (error.message.includes('team_is_full')) {
      return { error: 'এই দলটিতে সদস্য সংখ্যা পূর্ণ হয়ে গেছে।' };
    }
    if (error.message.includes('invalid_join_token')) {
      return { error: 'প্রাইভেট দলের জন্য যোগদান টোকেনটি ভুল।' };
    }
    return { error: 'দলে যোগ দেওয়া যায় নি।' };
  }

  revalidatePath('/teams');
  return { success: true };
}

export async function leaveTeam(teamId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
  }

  // Check if the user is the last admin
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('user_id, role')
    .eq('team_id', teamId);

  if (membersError) {
    return { error: 'সদস্যদের তথ্য আনা যায়নি।' };
  }

  const admins = members.filter((m) => m.role === 'admin');
  const isLastAdmin = admins.length === 1 && admins[0].user_id === user.id;

  if (isLastAdmin && members.length > 1) {
    return { error: 'আপনি শেষ অ্যাডমিন হিসেবে দল ছাড়তে পারবেন না। অনুগ্রহ করে অন্য কাউকে অ্যাডমিন বানান।' };
  }

  const { error: deleteError } = await supabase
    .from('team_members')
    .delete()
    .match({ team_id: teamId, user_id: user.id });

  if (deleteError) {
    return { error: 'দল ছাড়া যায়নি।' };
  }

  // If the last member leaves, delete the team
  if (members.length === 1) {
    await supabase.from('teams').delete().eq('id', teamId);
  }

  revalidatePath('/teams');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function kickMember(teamId: string, memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
  }

  const { error } = await supabase.rpc('kick_team_member', {
    p_team_id: teamId,
    p_kicker_id: user.id,
    p_member_to_kick_id: memberId,
  });

  if (error) {
    console.error('Error kicking member:', error.message);
    return { error: `সদস্যকে বাদ দেওয়া যায় নি: ${error.message}` };
  }

  revalidatePath(`/teams/${teamId}`);
  revalidatePath('/teams');
  return { success: true };
}


export async function postTeamMessage(teamId: string, message: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
  }

  // Verify user is in the team
  const { data: member, error: memberError } = await supabase
    .from('team_members')
    .select('team_id')
    .match({ user_id: user.id, team_id: teamId })
    .single();

  if (memberError || !member) {
    return { error: 'আপনি এই দলের সদস্য নন।' };
  }

  const { error } = await supabase.from('team_chat_messages').insert({
    team_id: teamId,
    user_id: user.id,
    message,
  });

  if (error) {
    console.error('Error posting message:', error);
    return { error: 'বার্তা পাঠানো যায়নি।' };
  }

  // No revalidation needed, will be handled by realtime subscription
  return { success: true };
}

export async function purchaseTeamItem(teamId: string, itemId: number) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'আপনাকে অবশ্যই লগইন করতে হবে।' };
  }

  const { error } = await supabase.rpc('purchase_team_item', {
    p_team_id: teamId,
    p_item_id: itemId,
    p_user_id: user.id,
  });

  if (error) {
    console.error('Error purchasing team item:', error);
    return { error: 'আইটেম কেনা যায়নি। আপনার দলের কি যথেষ্ট পয়েন্ট আছে?' };
  }

  revalidatePath(`/teams/${teamId}`);
  return { success: true, message: 'আইটেম সফলভাবে কেনা হয়েছে!' };
}
