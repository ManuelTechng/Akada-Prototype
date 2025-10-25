# Database Queries and Results

## Query 2: Verify Successful Matches

```sql
SELECT 
  p.id,
  p.name AS program_name,
  p.university AS old_university_text,
  u.name AS matched_university_name,
  p.city AS old_city_text,
  c.name AS matched_city_name
FROM programs p
LEFT JOIN universities u ON p.university_id = u.id
LEFT JOIN cities c ON p.city_id = c.id
WHERE p.university_id IS NOT NULL OR p.city_id IS NOT NULL
ORDER BY u.name, c.name;
```

### Result:

```json
[
  {
    "id": "ccf86a96-3f38-4917-bf14-a0b22789a5fb",
    "program_name": "MSc Data Science",
    "old_university_text": "Imperial College London",
    "matched_university_name": "Imperial College London",
    "old_city_text": "London",
    "matched_city_name": "London"
  },
  {
    "id": "141252b7-d034-4c18-9021-8fe690a100a6",
    "program_name": "MSc Computing Science",
    "old_university_text": "Imperial College London",
    "matched_university_name": "Imperial College London",
    "old_city_text": null,
    "matched_city_name": null
  },
  {
    "id": "cbc9e938-d7c0-4395-9a74-13ab5fac0b53",
    "program_name": "Master of Science in Mechanical Engineering",
    "old_university_text": "Massachusetts Institute of Technology",
    "matched_university_name": "Massachusetts Institute of Technology",
    "old_city_text": "Cambridge",
    "matched_city_name": null
  },
  {
    "id": "46af15fb-13eb-448c-a30a-3a7fbbdc43d0",
    "program_name": "MEng Software Engineering",
    "old_university_text": "McGill University",
    "matched_university_name": "McGill University",
    "old_city_text": "Montreal",
    "matched_city_name": "Montreal"
  },
  {
    "id": "df825f2e-f9e7-4c8a-90f0-928de18a2a89",
    "program_name": "Master of Science in Electrical Engineering",
    "old_university_text": "Stanford University",
    "matched_university_name": "Stanford University",
    "old_city_text": "Stanford",
    "matched_city_name": null
  },
  {
    "id": "b1c33126-88d0-4a86-a9cf-52b5945ddf04",
    "program_name": "MSc Science in Computer Science",
    "old_university_text": "Technical University of Munich",
    "matched_university_name": "Technical University of Munich",
    "old_city_text": null,
    "matched_city_name": null
  },
  {
    "id": "47122605-b8c5-48b3-9b12-8cae6464a5e7",
    "program_name": "MSc Computer Science",
    "old_university_text": "University of British Columbia",
    "matched_university_name": "University of British Columbia",
    "old_city_text": null,
    "matched_city_name": null
  },
  {
    "id": "b1eb47bb-b1ef-4b86-aeab-8d7b72de5eb0",
    "program_name": "PhD Computer Science",
    "old_university_text": "University of Cambridge",
    "matched_university_name": "University of Cambridge",
    "old_city_text": "Cambridge",
    "matched_city_name": null
  },
  {
    "id": "12f6c452-ce60-492f-af77-68d3bbf2e9a1",
    "program_name": "MSc Computer Science",
    "old_university_text": "University of Edinburgh",
    "matched_university_name": "University of Edinburgh",
    "old_city_text": "Edinburgh",
    "matched_city_name": "Edinburgh"
  },
  {
    "id": "e592c3be-ddea-48de-8c24-23fc09fec898",
    "program_name": "MSc Data Science",
    "old_university_text": "University of Manchester",
    "matched_university_name": "University of Manchester",
    "old_city_text": "Manchester",
    "matched_city_name": "Manchester"
  },
  {
    "id": "e84c6582-29c0-41cd-a16c-35e468fb39a6",
    "program_name": "MSc Data Science",
    "old_university_text": "University of Manchester",
    "matched_university_name": "University of Manchester",
    "old_city_text": "Manchester",
    "matched_city_name": "Manchester"
  },
  {
    "id": "711f1a76-6fb3-4ce2-bcd0-e8fe835d83cf",
    "program_name": "MSc Information Technology",
    "old_university_text": "University of Melbourne",
    "matched_university_name": "University of Melbourne",
    "old_city_text": null,
    "matched_city_name": null
  },
  {
    "id": "32fef3a8-145d-49fe-9600-b592b4851c44",
    "program_name": "MSc Computer Science",
    "old_university_text": "University of Toronto",
    "matched_university_name": "University of Toronto",
    "old_city_text": "Toronto",
    "matched_city_name": "Toronto"
  },
  {
    "id": "e730c36d-87ce-4db2-8637-e756c49558a5",
    "program_name": "MSc Applied Science in Computer Engineering",
    "old_university_text": "University of Toronto",
    "matched_university_name": "University of Toronto",
    "old_city_text": null,
    "matched_city_name": null
  },
  {
    "id": "c10b3b95-4d14-4b9b-be79-2d35826cfbca",
    "program_name": "MSc Computer Science",
    "old_university_text": "University of Waterloo",
    "matched_university_name": "University of Waterloo",
    "old_city_text": "Waterloo",
    "matched_city_name": null
  },
  {
    "id": "815db761-a89b-44ef-9067-3dea0f3e3572",
    "program_name": "Master of Business Administration (MBA)",
    "old_university_text": "Harvard Business School",
    "matched_university_name": null,
    "old_city_text": "Boston",
    "matched_city_name": "Boston"
  },
  {
    "id": "5c75f4e8-3d90-44e8-aba8-897a946d2de4",
    "program_name": "BSc Software Engineering",
    "old_university_text": "University of Lagos",
    "matched_university_name": null,
    "old_city_text": "Lagos",
    "matched_city_name": "Lagos"
  },
  {
    "id": "f9eb4dc9-34ca-4ae5-8e99-45f5aaa354e5",
    "program_name": "Master of Business Administration (MBA)",
    "old_university_text": "London Business School",
    "matched_university_name": null,
    "old_city_text": "London",
    "matched_city_name": "London"
  }
]
```

---

## Query 3: List Unmatched Universities

```sql
SELECT DISTINCT
  university AS unmatched_university_text,
  COUNT(*) AS program_count
FROM programs
WHERE university_id IS NULL
GROUP BY university
ORDER BY program_count DESC;
```

### Result:

```json
[
  {
    "unmatched_university_text": "Arizona State University",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Carnegie Mellon University",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Chalmers University",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Cornell University",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Covenant University",
    "program_count": 1
  },
  {
    "unmatched_university_text": "ETH Zurich",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Georgia Institute of Technology",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Georgia Tech",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Harvard Business School",
    "program_count": 1
  },
  {
    "unmatched_university_text": "INSEAD",
    "program_count": 1
  },
  {
    "unmatched_university_text": "KTH Royal Institute of Technology",
    "program_count": 1
  },
  {
    "unmatched_university_text": "London Business School",
    "program_count": 1
  },
  {
    "unmatched_university_text": "National University of Singapore",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of Birmingham",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of California, Berkeley",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of California, San Diego",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of Cape Town",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of Lagos",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of Oslo",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of Texas at Austin",
    "program_count": 1
  },
  {
    "unmatched_university_text": "University of Washington",
    "program_count": 1
  },
  {
    "unmatched_university_text": "Wharton School",
    "program_count": 1
  }
]
```

---

## Query 4: List Unmatched Cities

```sql
SELECT DISTINCT
  city AS unmatched_city_text,
  country,
  COUNT(*) AS program_count
FROM programs
WHERE city_id IS NULL
GROUP BY city, country
ORDER BY country, program_count DESC;
```

### Result:

```json
[
  {
    "unmatched_city_text": null,
    "country": "Australia",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "Canada",
    "program_count": 2
  },
  {
    "unmatched_city_text": "Waterloo",
    "country": "Canada",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Fontainebleau",
    "country": "France",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "Germany",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "Nigeria",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "Norway",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "Singapore",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "South Africa",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Gothenburg",
    "country": "Sweden",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Stockholm",
    "country": "Sweden",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Zurich",
    "country": "Switzerland",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Birmingham",
    "country": "United Kingdom",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Cambridge",
    "country": "United Kingdom",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "United Kingdom",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Atlanta",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Austin",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Berkeley",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Cambridge",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Ithaca",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "La Jolla",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Philadelphia",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Pittsburgh",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Seattle",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Stanford",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": "Tempe",
    "country": "United States",
    "program_count": 1
  },
  {
    "unmatched_city_text": null,
    "country": "United States",
    "program_count": 1
  }
]
```

---

## Check Universities Table Structure and Data

### Query: Get First 5 Universities

```sql
SELECT * 
FROM universities 
ORDER BY name
LIMIT 5;
```

### Result:

```json
[
  {
    "id": "b53ff40a-311a-4822-a9a8-f7e4c3dba8b1",
    "name": "Australian National University",
    "country_code": "AUS",
    "city_id": null,
    "type": "Public",
    "website": "https://www.anu.edu.au",
    "logo_url": null,
    "description": "National research university in Canberra",
    "founded_year": null,
    "ranking_world": 30,
    "ranking_national": null,
    "total_students": 25000,
    "international_students": 7000,
    "acceptance_rate": "35.00",
    "accreditations": null,
    "contact_email": null,
    "created_at": "2025-10-23 22:08:53.036193+00",
    "updated_at": "2025-10-23 22:08:53.036193+00"
  },
  {
    "id": "679414f8-bf46-4f70-a8d6-f50910ae25f8",
    "name": "Harvard University",
    "country_code": "USA",
    "city_id": "5683dd30-994a-4565-a901-63f7c5a2ea72",
    "type": "Private",
    "website": "https://www.harvard.edu",
    "logo_url": null,
    "description": "Oldest and most prestigious university in the United States",
    "founded_year": null,
    "ranking_world": 4,
    "ranking_national": null,
    "total_students": 23000,
    "international_students": 5800,
    "acceptance_rate": "3.40",
    "accreditations": null,
    "contact_email": null,
    "created_at": "2025-10-23 22:08:53.036193+00",
    "updated_at": "2025-10-23 22:08:53.036193+00"
  },
  {
    "id": "336023c6-873f-4832-903c-f654ca2ed265",
    "name": "Heidelberg University",
    "country_code": "DEU",
    "city_id": null,
    "type": "Public",
    "website": "https://www.uni-heidelberg.de",
    "logo_url": null,
    "description": "Germany's oldest university",
    "founded_year": null,
    "ranking_world": 42,
    "ranking_national": null,
    "total_students": 30000,
    "international_students": 6000,
    "acceptance_rate": "19.00",
    "accreditations": null,
    "contact_email": null,
    "created_at": "2025-10-23 22:08:53.036193+00",
    "updated_at": "2025-10-23 22:08:53.036193+00"
  },
  {
    "id": "f580bc5f-f5e6-4917-806d-8268c0279f83",
    "name": "Imperial College London",
    "country_code": "GBR",
    "city_id": "f3782ebb-0be6-4dbe-82d8-557abe13aaf1",
    "type": "Public",
    "website": "https://www.imperial.ac.uk",
    "logo_url": null,
    "description": "Specialized in science, engineering, medicine and business",
    "founded_year": null,
    "ranking_world": 6,
    "ranking_national": null,
    "total_students": 19000,
    "international_students": 9500,
    "acceptance_rate": "14.30",
    "accreditations": null,
    "contact_email": null,
    "created_at": "2025-10-23 22:08:53.036193+00",
    "updated_at": "2025-10-23 22:08:53.036193+00"
  },
  {
    "id": "04795156-ef17-42f6-a72a-cb3c4212d4f0",
    "name": "Ludwig Maximilian University of Munich",
    "country_code": "DEU",
    "city_id": "6fda3d8f-eebf-4392-82ed-7bbe2d11d35d",
    "type": "Public",
    "website": "https://www.lmu.de",
    "logo_url": null,
    "description": "Leading research university in Munich",
    "founded_year": null,
    "ranking_world": 54,
    "ranking_national": null,
    "total_students": 52000,
    "international_students": 8000,
    "acceptance_rate": "17.00",
    "accreditations": null,
    "contact_email": null,
    "created_at": "2025-10-23 22:08:53.036193+00",
    "updated_at": "2025-10-23 22:08:53.036193+00"
  }
]
```

---

### Query: Get All Universities Summary

```sql
SELECT id, name, country_code, ranking_world 
FROM universities 
ORDER BY name;
```

### Result:

```json
[
  {
    "id": "b53ff40a-311a-4822-a9a8-f7e4c3dba8b1",
    "name": "Australian National University",
    "country_code": "AUS",
    "ranking_world": 30
  },
  {
    "id": "679414f8-bf46-4f70-a8d6-f50910ae25f8",
    "name": "Harvard University",
    "country_code": "USA",
    "ranking_world": 4
  },
  {
    "id": "336023c6-873f-4832-903c-f654ca2ed265",
    "name": "Heidelberg University",
    "country_code": "DEU",
    "ranking_world": 42
  },
  {
    "id": "f580bc5f-f5e6-4917-806d-8268c0279f83",
    "name": "Imperial College London",
    "country_code": "GBR",
    "ranking_world": 6
  },
  {
    "id": "04795156-ef17-42f6-a72a-cb3c4212d4f0",
    "name": "Ludwig Maximilian University of Munich",
    "country_code": "DEU",
    "ranking_world": 54
  },
  {
    "id": "d0eb0f5e-13bb-4dad-8a80-d9df9ea82ac5",
    "name": "Massachusetts Institute of Technology",
    "country_code": "USA",
    "ranking_world": 1
  },
  {
    "id": "efef3be9-4365-4c43-8006-875d82b2183a",
    "name": "McGill University",
    "country_code": "CAN",
    "ranking_world": 31
  },
  {
    "id": "b31551c2-6f20-4a57-814b-bd8aabd64606",
    "name": "Stanford University",
    "country_code": "USA",
    "ranking_world": 3
  },
  {
    "id": "442dc194-a685-4c49-b12d-408a79be7df0",
    "name": "Technical University of Munich",
    "country_code": "DEU",
    "ranking_world": 37
  },
  {
    "id": "8574699e-6ca0-4831-8407-ff9ec53079c4",
    "name": "University College London",
    "country_code": "GBR",
    "ranking_world": 8
  },
  {
    "id": "0fc2801d-bbe4-4be1-8388-ae090a79786a",
    "name": "University of British Columbia",
    "country_code": "CAN",
    "ranking_world": 34
  },
  {
    "id": "9d08a805-b78c-49a1-9750-74771bc10c15",
    "name": "University of Cambridge",
    "country_code": "GBR",
    "ranking_world": 5
  },
  {
    "id": "f70a86f3-ed7c-4f3c-a812-548dad6aae12",
    "name": "University of Chicago",
    "country_code": "USA",
    "ranking_world": 10
  },
  {
    "id": "d51596dc-d8d1-48bb-afa0-e42a24891c7f",
    "name": "University of Edinburgh",
    "country_code": "GBR",
    "ranking_world": 22
  },
  {
    "id": "54cc8c69-37ee-4a62-8d9f-6e2426b0d63d",
    "name": "University of Manchester",
    "country_code": "GBR",
    "ranking_world": 27
  },
  {
    "id": "9d4cbdec-cf05-4e58-bab3-ec389a979318",
    "name": "University of Melbourne",
    "country_code": "AUS",
    "ranking_world": 14
  },
  {
    "id": "5ab6a458-bbc6-4248-9b30-07b2d5c7ae31",
    "name": "University of Oxford",
    "country_code": "GBR",
    "ranking_world": 2
  },
  {
    "id": "e659c1b0-1eec-4d25-8461-5c6c89e7a167",
    "name": "University of Sydney",
    "country_code": "AUS",
    "ranking_world": 19
  },
  {
    "id": "c51415ba-9585-4592-8f90-0336e2de28df",
    "name": "University of Toronto",
    "country_code": "CAN",
    "ranking_world": 18
  },
  {
    "id": "f1c73f98-805a-424c-a188-77c7cf6827b9",
    "name": "University of Waterloo",
    "country_code": "CAN",
    "ranking_world": 151
  }
]
```
