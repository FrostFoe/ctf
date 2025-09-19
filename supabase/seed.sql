
-- Seed data for challenges
INSERT INTO public.challenges (id, name, description, category, difficulty, points, flag, featured, features)
VALUES
  ('web-101', 'Web Exploitation 101', 'A beginner-friendly web challenge.', 'beginner', 'easy', 10, 'ff{web_is_fun}', false, '{"HTML", "JavaScript"}'),
  ('crypto-basics', 'Crypto Basics', 'Learn the basics of cryptography.', 'beginner', 'easy', 15, 'ff{crypto_is_cool}', true, '{"Caesar Cipher"}'),
  ('re-for-dummies', 'Reverse Engineering for Dummies', 'An easy reverse engineering task.', 'hacker', 'medium', 50, 'ff{re_is_awesome}', false, '{"Assembly", "Debugging"}'),
  ('pwn-the-kernel', 'Pwn the Kernel', 'A hard kernel exploitation challenge.', 'hacker', 'hard', 100, 'ff{kernel_master}', true, '{"Linux Kernel", "C"}');
