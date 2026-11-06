-- Reviewed against data/mmd_20260909.csv; see docs/data-review/idiom-review-20261105.csv.
-- Run in Supabase SQL Editor, then reload the app and start a new session.
-- Only changes matching entries still labeled idiom. Safe to rerun.
begin;
with corrections(id, chinese, new_pos) as (
  values
    ('word:333', '名言', 'noun'),
    ('word:334', '名句', 'noun'),
    ('word:604', '习语', 'noun'),
    ('word:898', '成语', 'noun'),
    ('word:1226', '说法', 'noun'),
    ('word:3382', '俗话', 'noun'),
    ('word:4205', '男的跟男的才叫真爱女的跟男的在一起那才叫繁衍后代', 'sentence'),
    ('word:5395', '告诉你的伴侣你喜欢他或她的哪些方面；这次请非常真诚, 说出平时不会对刚认识的人说的话。', 'sentence'),
    ('word:5434', '一夜情', 'noun'),
    ('word:6033', '不可抗力', 'noun'),
    ('word:6737', '早睡早起对身体好', 'sentence'),
    ('word:6922', '脱口秀', 'noun'),
    ('word:7806', '反向旅游', 'noun'),
    ('word:8595', '俗语', 'noun')
)
update public.study_content as content
set payload = jsonb_set(content.payload, '{part_of_speech}', to_jsonb(corrections.new_pos)),
    updated_at = now()
from corrections
where content.id = corrections.id
  and content.kind = 'word'
  and content.payload->>'chinese' = corrections.chinese
  and content.payload->>'part_of_speech' = 'idiom'
returning content.id, content.payload->>'chinese' as chinese,
          content.payload->>'part_of_speech' as part_of_speech;
commit;
