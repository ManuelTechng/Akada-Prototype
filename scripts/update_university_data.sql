-- =====================================================
-- University Data Update Script
-- =====================================================
-- Updates 41 institutions with complete research data
-- Fields: total_students, international_students, acceptance_rate, ranking_world
-- Research Date: October 25, 2025
-- =====================================================

-- Note: Acceptance rates are stored as percentages (e.g., 43 for 43%, not 0.43)
-- The UI code handles both decimal and percentage formats automatically

UPDATE universities
SET
  total_students = CASE name
    WHEN 'Massachusetts Institute of Technology' THEN 11520
    WHEN 'University of Oxford' THEN 24000
    WHEN 'Stanford University' THEN 17000
    WHEN 'Harvard University' THEN 23000
    WHEN 'University of Cambridge' THEN 24000
    WHEN 'University of Washington' THEN 50000
    WHEN 'Imperial College London' THEN 19000
    WHEN 'ETH Zurich' THEN 24530
    WHEN 'University College London' THEN 43000
    WHEN 'University of Chicago' THEN 17000
    WHEN 'National University of Singapore' THEN 51568
    WHEN 'Cornell University' THEN 26284
    WHEN 'University of Melbourne' THEN 51000
    WHEN 'University of Toronto' THEN 95000
    WHEN 'University of Sydney' THEN 73000
    WHEN 'University of California, San Diego' THEN 34955
    WHEN 'University of Edinburgh' THEN 35000
    WHEN 'University of Manchester' THEN 40000
    WHEN 'University of California, Berkeley' THEN 45700
    WHEN 'Australian National University' THEN 25000
    WHEN 'McGill University' THEN 40000
    WHEN 'University of British Columbia' THEN 70000
    WHEN 'Technical University of Munich' THEN 45000
    WHEN 'Georgia Institute of Technology' THEN 40000
    WHEN 'Heidelberg University' THEN 30000
    WHEN 'University of Texas at Austin' THEN 51000
    WHEN 'Carnegie Mellon University' THEN 16676
    WHEN 'Ludwig Maximilian University of Munich' THEN 52000
    WHEN 'KTH Royal Institute of Technology' THEN 13955
    WHEN 'University of Birmingham' THEN 40000
    WHEN 'University of Oslo' THEN 26650
    WHEN 'Chalmers University of Technology' THEN 10000
    WHEN 'University of Waterloo' THEN 42000
    WHEN 'University of Cape Town' THEN 21961
    WHEN 'Arizona State University' THEN 165000
    WHEN 'University of Lagos' THEN 48680
    WHEN 'Covenant University' THEN 9690
    WHEN 'London Business School' THEN 2000
    WHEN 'INSEAD' THEN 1000
    WHEN 'Wharton School' THEN 2304
    WHEN 'Harvard Business School' THEN 1930
    ELSE total_students
  END,

  international_students = CASE name
    WHEN 'Massachusetts Institute of Technology' THEN 3960
    WHEN 'University of Oxford' THEN 9000
    WHEN 'Stanford University' THEN 3600
    WHEN 'Harvard University' THEN 5800
    WHEN 'University of Cambridge' THEN 8000
    WHEN 'University of Washington' THEN 10000
    WHEN 'Imperial College London' THEN 9500
    WHEN 'ETH Zurich' THEN 9800
    WHEN 'University College London' THEN 19000
    WHEN 'University of Chicago' THEN 4800
    WHEN 'National University of Singapore' THEN 13400
    WHEN 'Cornell University' THEN 1527
    WHEN 'University of Melbourne' THEN 22000
    WHEN 'University of Toronto' THEN 23000
    WHEN 'University of Sydney' THEN 27000
    WHEN 'University of California, San Diego' THEN 3891
    WHEN 'University of Edinburgh' THEN 14000
    WHEN 'University of Manchester' THEN 12000
    WHEN 'University of California, Berkeley' THEN 7856
    WHEN 'Australian National University' THEN 7000
    WHEN 'McGill University' THEN 12000
    WHEN 'University of British Columbia' THEN 18000
    WHEN 'Technical University of Munich' THEN 10000
    WHEN 'Georgia Institute of Technology' THEN 10525
    WHEN 'Heidelberg University' THEN 6000
    WHEN 'University of Texas at Austin' THEN 6644
    WHEN 'Carnegie Mellon University' THEN 7530
    WHEN 'Ludwig Maximilian University of Munich' THEN 8000
    WHEN 'KTH Royal Institute of Technology' THEN 3738
    WHEN 'University of Birmingham' THEN 8700
    WHEN 'University of Oslo' THEN 4000
    WHEN 'Chalmers University of Technology' THEN 2400
    WHEN 'University of Waterloo' THEN 8400
    WHEN 'University of Cape Town' THEN 2863
    WHEN 'Arizona State University' THEN 17900
    WHEN 'University of Lagos' THEN NULL  -- Not specified
    WHEN 'Covenant University' THEN 80
    WHEN 'London Business School' THEN 1900  -- ~95% of 2000
    WHEN 'INSEAD' THEN 970  -- ~97% of 1000
    WHEN 'Wharton School' THEN 714  -- 31% of 2304
    WHEN 'Harvard Business School' THEN 714  -- ~37% of 1930
    ELSE international_students
  END,

  acceptance_rate = CASE name
    WHEN 'Massachusetts Institute of Technology' THEN 3.20
    WHEN 'University of Oxford' THEN 17.50
    WHEN 'Stanford University' THEN 3.90
    WHEN 'Harvard University' THEN 3.40
    WHEN 'University of Cambridge' THEN 21.00
    WHEN 'University of Washington' THEN 39.15
    WHEN 'Imperial College London' THEN 14.30
    WHEN 'ETH Zurich' THEN 27.00
    WHEN 'University College London' THEN 48.00
    WHEN 'University of Chicago' THEN 5.90
    WHEN 'National University of Singapore' THEN 7.50  -- Average of 5-10%
    WHEN 'Cornell University' THEN 8.41
    WHEN 'University of Melbourne' THEN 70.00
    WHEN 'University of Toronto' THEN 43.00
    WHEN 'University of Sydney' THEN 65.00
    WHEN 'University of California, San Diego' THEN 26.77
    WHEN 'University of Edinburgh' THEN 40.00
    WHEN 'University of Manchester' THEN 56.00
    WHEN 'University of California, Berkeley' THEN 11.40
    WHEN 'Australian National University' THEN 35.00
    WHEN 'McGill University' THEN 46.00
    WHEN 'University of British Columbia' THEN 52.00
    WHEN 'Technical University of Munich' THEN 8.00
    WHEN 'Georgia Institute of Technology' THEN 15.00  -- Average of 14-16%
    WHEN 'Heidelberg University' THEN 19.00
    WHEN 'University of Texas at Austin' THEN 29.00
    WHEN 'Carnegie Mellon University' THEN 11.70
    WHEN 'Ludwig Maximilian University of Munich' THEN 17.00
    WHEN 'KTH Royal Institute of Technology' THEN 32.00  -- Average of 29-35%
    WHEN 'University of Birmingham' THEN 14.00  -- Average of 13-15%
    WHEN 'University of Oslo' THEN 16.00  -- Average of 5-27%
    WHEN 'Chalmers University of Technology' THEN 85.00  -- Average of 80-90%
    WHEN 'University of Waterloo' THEN 53.00
    WHEN 'University of Cape Town' THEN 30.00  -- Average of 25-35%
    WHEN 'Arizona State University' THEN 89.63
    WHEN 'University of Lagos' THEN 14.50  -- Average of 10-19%
    WHEN 'Covenant University' THEN 64.50  -- Average of 40-89%
    WHEN 'London Business School' THEN 20.00
    WHEN 'INSEAD' THEN 23.00  -- Average of 15-31%
    WHEN 'Wharton School' THEN 21.00  -- MBA program
    WHEN 'Harvard Business School' THEN 12.00  -- Average of 11-13%
    ELSE acceptance_rate
  END,

  ranking_world = CASE name
    WHEN 'Massachusetts Institute of Technology' THEN 1
    WHEN 'University of Oxford' THEN 2
    WHEN 'Stanford University' THEN 3
    WHEN 'Harvard University' THEN 4
    WHEN 'University of Cambridge' THEN 5
    WHEN 'University of Washington' THEN 6
    WHEN 'Imperial College London' THEN 6
    WHEN 'ETH Zurich' THEN 7
    WHEN 'University College London' THEN 8
    WHEN 'University of Chicago' THEN 10
    WHEN 'National University of Singapore' THEN 11
    WHEN 'Cornell University' THEN 12
    WHEN 'University of Melbourne' THEN 14
    WHEN 'University of Toronto' THEN 18
    WHEN 'University of Sydney' THEN 19
    WHEN 'University of California, San Diego' THEN 21
    WHEN 'University of Edinburgh' THEN 22
    WHEN 'University of Manchester' THEN 27
    WHEN 'University of California, Berkeley' THEN 27
    WHEN 'Australian National University' THEN 30
    WHEN 'McGill University' THEN 31
    WHEN 'University of British Columbia' THEN 34
    WHEN 'Technical University of Munich' THEN 37
    WHEN 'Georgia Institute of Technology' THEN 38
    WHEN 'Heidelberg University' THEN 42
    WHEN 'University of Texas at Austin' THEN 43
    WHEN 'Carnegie Mellon University' THEN 52
    WHEN 'Ludwig Maximilian University of Munich' THEN 54
    WHEN 'KTH Royal Institute of Technology' THEN 89
    WHEN 'University of Birmingham' THEN 91
    WHEN 'University of Oslo' THEN 117
    WHEN 'Chalmers University of Technology' THEN 125
    WHEN 'University of Waterloo' THEN 151
    WHEN 'University of Cape Town' THEN 173
    WHEN 'Arizona State University' THEN 216
    WHEN 'University of Lagos' THEN 1342
    WHEN 'Covenant University' THEN 2117
    WHEN 'London Business School' THEN 3  -- Business school ranking
    WHEN 'INSEAD' THEN 5  -- Business school ranking
    WHEN 'Wharton School' THEN 4  -- Part of UPenn overall
    WHEN 'Harvard Business School' THEN 4  -- Part of Harvard overall
    ELSE ranking_world
  END,

  updated_at = NOW()

WHERE name IN (
  'Massachusetts Institute of Technology',
  'University of Oxford',
  'Stanford University',
  'Harvard University',
  'University of Cambridge',
  'University of Washington',
  'Imperial College London',
  'ETH Zurich',
  'University College London',
  'University of Chicago',
  'National University of Singapore',
  'Cornell University',
  'University of Melbourne',
  'University of Toronto',
  'University of Sydney',
  'University of California, San Diego',
  'University of Edinburgh',
  'University of Manchester',
  'University of California, Berkeley',
  'Australian National University',
  'McGill University',
  'University of British Columbia',
  'Technical University of Munich',
  'Georgia Institute of Technology',
  'Heidelberg University',
  'University of Texas at Austin',
  'Carnegie Mellon University',
  'Ludwig Maximilian University of Munich',
  'KTH Royal Institute of Technology',
  'University of Birmingham',
  'University of Oslo',
  'Chalmers University of Technology',
  'University of Waterloo',
  'University of Cape Town',
  'Arizona State University',
  'University of Lagos',
  'Covenant University',
  'London Business School',
  'INSEAD',
  'Wharton School',
  'Harvard Business School'
);

-- Verification query to check the updates
SELECT
  name,
  total_students,
  international_students,
  acceptance_rate,
  ranking_world,
  updated_at
FROM universities
WHERE name IN (
  'Massachusetts Institute of Technology',
  'University of Oxford',
  'Stanford University',
  'Harvard University',
  'University of Toronto',
  'London Business School'
)
ORDER BY ranking_world;
