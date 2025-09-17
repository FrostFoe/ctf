-- Create the challenges table
CREATE TABLE challenges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    features TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    difficulty TEXT,
    category TEXT,
    flag TEXT,
    url TEXT
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Policies for challenges
-- Allow public read access
CREATE POLICY "Allow read access to all users" ON challenges
FOR SELECT USING (true);

-- Allow admin users to insert, update, and delete
-- NOTE: This assumes you have a way to identify admins, e.g., via a custom claim or roles table.
-- For this example, we'll just allow all authenticated users to modify.
-- In a real app, you MUST restrict this to admins.
CREATE POLICY "Allow full access for authenticated users" ON challenges
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Seed the challenges table with initial data
INSERT INTO challenges (id, name, icon, description, features, featured, difficulty, category)
VALUES
('beginner-detective', 'গোয়েন্দা', '/assets/icons/ctf-tiers/detective-icon.svg', 'সাধারণ গোয়েন্দাগিরি - ক্লু খুঁজে বের করুন এবং রহস্য সমাধান করুন।', '{"বেসিক ক্লু হান্টিং", "লজিকাল থিংকিং", "স্টোরি বেসড চ্যালেঞ্জ", "১০-১৫ মিনিট সময় লাগে"}', false, 'easy', 'beginner'),
('beginner-riddle', 'রিডল', '/assets/icons/ctf-tiers/riddle-icon.svg', 'বুদ্ধিমত্তার পরীক্ষা - ধাঁধাঁ সমাধান করে অগ্রসর হোন।', '{"ক্রিয়েটিভ রিডলস", "پ্যাটার্ন রেকগনিশন", "ব্রেইন টিউজার", "১৫-২০ মিনিট সময় লাগে"}', true, 'easy', 'beginner'),
('beginner-spy', 'স্পাই মিশন', '/assets/icons/ctf-tiers/spy-icon.svg', 'গোপন মিশন - তথ্য সংগ্রহ করে লক্ষ্য অর্জন করুন।', '{"ইনফরমেশন গ্যাদারিring", "স্টেলথ অপারেশন", "মিশন কমপ্লিট", "২০-২৫ মিনিট সময় লাগে"}', false, 'easy', 'beginner'),
('intermediate-crypto', 'ক্রিপ্টো', '/assets/icons/ctf-tiers/crypto-icon.svg', 'এনক্রিপশনের জগত - কোড ভেঙে তথ্য উদ্ধার করুন।', '{"এডভান্সড এনক্রিপশন", "ক্রিপ্টোগ্রাফিক অ্যাটাক", "কী ব্রেকিং", "ম্যাথমেটিক্যাল থিংকিং", "২৫-৩৫ মিনিট সময় লাগে"}', false, 'medium', 'hacker'),
('intermediate-web', 'ওয়েব সিকিউরিটি', '/assets/icons/ctf-tiers/web-icon.svg', 'ওয়েব অ্যাপ্লিকেশন ভালনারেবিলিটি - সিকিউরিটি ফ্লস খুঁজে বের করুন।', '{"এসকিউএল ইনজেকশন", "ক্রস-সাইট স্ক্রিপ্টিং", "ওয়েব ভালনারেবিলিটি", "পেন্টেস্টিং", "৩০-৪০ মিনিট সময় লাগে"}', true, 'medium', 'hacker'),
('advanced-binary', 'বাইনারি এক্সপ্লয়েট', '/assets/icons/ctf-tiers/binary-icon.svg', 'এক্সপার্ট লেভেল - বাইনারি কোড অ্যানালাইসিস এবং এক্সপ্লয়েট।', '{"রিভার্স ইঞ্জিনিয়ারিং", "বাফার ওভারফ্লো", "মেমরি করাপশন", "এডভান্সড এক্সপ্লয়েট", "৪৫+ মিনিট সময় লাগে"}', false, 'hard', 'hacker');
