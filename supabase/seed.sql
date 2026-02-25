-- ============================================
-- Seed data (optional)
-- ============================================
-- Run AFTER schema.sql. For full seeding (tasks, notifications, activities)
-- use: npx tsx scripts/seed-database.ts
-- ============================================

INSERT INTO users (id, name, role, avatar)
VALUES ('current', 'Alex Morgan', 'Product Manager', '')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, avatar = EXCLUDED.avatar;

INSERT INTO team_members (id, name, email, avatar, role, "tasksAssigned", "tasksOverdue")
VALUES
  ('1', 'Sarah Connor', 'sarah.c@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3tgryqD_nkGvBmRRpnnVVTn1NcPdMEOn291SW6BJZU7kNJkg0Znt7klcHoXVECeBIvHkSxjPzD4VhdAayVJWDAnEAhy5r_ccpllgHRSkslZgCktVwmP8mtuG1uyetrCuUsyLpqeFK0CVRKig1i7wz42BHxj_7HZMogtHjbyCQ_jAYw5B-NMDCQy3G6Wlap2ZxjTft_ZNn5fwlLzazdToaIuXfubvtpDWhLeqLox0o48Xl13mUQ9PgMaXfj5jz5-A9eNeUqj9Nz0A', 'admin', 15, 1),
  ('2', 'Michael Chen', 'michael.chen@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIgg7tzuSFhKOhKIx8trD7OprLGHuE-rquj1bOK4V9boAhMpTDVFHlIY5JnNkPfbPUe2L0R3Up4Tb6Ov-di2cEqi2QGvlGk3WizGY9BmiQ_QOpKJ2QCEkD-nPEE96NZtr73_aIYKo-58rvqxAqDvDP9swemxgItjBf95Y-kUGyNRRUvJ2mt3x6gFL6V6gkcAAMB14dc7RZ01GKAyPXk0BKoe4RizkKwSX4azm6gqtVuGt5I2bBc5Tv0ZTBZGod4EweHRYEjkNW7KQ', 'member', 12, 0),
  ('3', 'Alice Johnson', 'alice.j@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-WnTjqP_5it3Hr_Bjd2AbLAVWqfbbGO-FotaGGnJWH456F2uXliA33ddJm1Su_Panw4ObRA83saIu9OtGbysWt2Zwuet9Y4KhSHYtsFciB2aONl6BRLLOKqWwUv7KJGm1b1QAgGh0RFxWgaFMd88yvcS-kG9CWT9SLd4qUdwHVIok8J5C1fKZwIN4M_f1PyjADbSbW3ND50a7SDyc-_orFy6s77bW3v73LhixbDFVbMMKyiscpAscec1rnPmfQK-dL-deRrQLvqo', 'member', 10, 2),
  ('4', 'Bob Smith', 'bob.smith@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjPnjJ-TH192V8kZEm-bK1XJ4QVv6c7u0KlbldSLJm_ZzzqCrJRaJn0YyP0JQ0ZYXVo91SRZYq8XkZ9n02c561Kx90KnLBaawz7AyYYB3ruK4KONoFOVHocBTmNzTVFS7sp6oHjV4ajpiE6R4U8n-yzIaxwvEUzdOLy8y-68k3FC7AFfQJPGNWhgIqaulbJO1W-R7vrjOFPjaEzRd9qUuOOajCeWyhXV6n-NzKIT6q0mdLPA1D9gyq5DaMw-VC2KNwTb7oBtWj7gw', 'member', 8, 1),
  ('5', 'Emily Davis', 'emily.d@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdCnsXRXUU3Y4pBuCN2glA6qMCbZnu8L2mDFQepMx0YPd0qsPwiEwbaKgFoVVIoW49VQXaZXuBVNjdyCvFAZnhPqQ_DWCmrRe_Wr3kgX-ll1Y3qCfh9vo6O-vzOn297cIhVaFTCMIuSh5zleQ1F4BsdXBCFOd0CbVOVlA_JWJ2T__AltSV16JRFz12gb8Tw8h1vNsA1k19Llt--mn9BbCcl9DptYUEiCJL2R_Xrz-wDPUxFQ8m9QWSr0bAO2MbzvnWDtEGrQFer3Q', 'member', 7, 0),
  ('6', 'John Doe', 'john.doe@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7hWydA9zlf6USNN_aTEPMIqqDK1H7lXxox4-nRlaIYMB61gVNTsYhsn1PeWDCFHQLpPnEiBzFqdRpZM4jZh9ozjfwKIxizeLzSA8h1ROmLM_HWjss_HDIXtJz39NgFphheah-rzCY_HwV0reWyGBrcEWSyTwBvJ4Wq6QoiIrK4mkPOzexB926PGlBScki_yHkiWqyZDZesyePhIv1pDsAS9KVEik-Pe4LlAghYDtmURUaFNK3dnf8-3ftbznMqZWY7Y-uP1YhMA0', 'member', 6, 0),
  ('7', 'Lisa James', 'lisa.j@testingcompany.com', '', 'member', 5, 0),
  ('8', 'David Wilson', 'david.w@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQEXSgSZ1ef32haRBH4W5GH-ZOWxNLX6_KNQW9qj364o-qa_6Ks_wwfO9_KLWCZwOElMaJpzXyk3zI6MX3MMAEtsFA433oG5wuZ03LkYNe1pN94iri65xTRc85L2g0rDLYtwAbebt3OcCZJIljZym2f_pEbNfdmeWTDT00YzxCVD3GZSGtBjnZ6okqP7hLdWi5ukEhewVT0ygkQBz502OryTpsM3EE2e3AC63WX98XE23CqQVB7VOeVLeSE16irut69U6TlPbHf3g', 'member', 4, 1),
  ('9', 'Sarah Wilson', 'sarah.w@testingcompany.com', '', 'member', 3, 0),
  ('10', 'Charlie Brown', 'charlie.b@testingcompany.com', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmMRfDmw-KdxcE3nVZOgaEEuCPIkgTCgP8mU252GNyo5-YEyinUmoMpwx1WnipeP1VE1hlrNCab9gC_x1mEZCzAsjrLDTM-6lZJ5kxsAOErtKy94BPQsEJKQ3UHr3pDw2ZYHMMekLbv3zU1yffSK72IYhZshT4Giw-LX9vpckKsMoUUCYhDRfmVhInOg1wuchCXS4OxoyzQzOHHGFY3tm2nwpc15le-wodT-GqESzMbFPI1NNdQdkyYUEXoEFswe5vdpj-hSeeqpM', 'guest', 2, 0),
  ('11', 'Owner', 'owner@example.com', '', 'owner', 0, 0)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, avatar = EXCLUDED.avatar, role = EXCLUDED.role, "tasksAssigned" = EXCLUDED."tasksAssigned", "tasksOverdue" = EXCLUDED."tasksOverdue";

INSERT INTO projects (id, name, client, progress, status, "dueDate", "taskCount", "teamMembers", "isOverdue")
VALUES
  ('1', 'Website Redesign', 'Testing Company', 75, 'on-track', TO_CHAR(CURRENT_DATE + INTERVAL '15 days', 'Mon DD, YYYY'), 24, '[]'::jsonb, false),
  ('2', 'Mobile App MVP', 'Testing Company', 40, 'at-risk', TO_CHAR(CURRENT_DATE + INTERVAL '35 days', 'Mon DD, YYYY'), 18, '[]'::jsonb, false),
  ('3', 'Q1 Marketing Campaign', 'Testing Company', 90, 'on-track', TO_CHAR(CURRENT_DATE + INTERVAL '5 days', 'Mon DD, YYYY'), 12, '[]'::jsonb, false),
  ('4', 'E-commerce Platform', 'Testing Company', 60, 'on-track', TO_CHAR(CURRENT_DATE + INTERVAL '50 days', 'Mon DD, YYYY'), 20, '[]'::jsonb, false),
  ('5', 'Brand Identity', 'Testing Company', 25, 'at-risk', TO_CHAR(CURRENT_DATE + INTERVAL '45 days', 'Mon DD, YYYY'), 8, '[]'::jsonb, false),
  ('6', 'Data Migration', 'Testing Company', 55, 'on-track', TO_CHAR(CURRENT_DATE + INTERVAL '25 days', 'Mon DD, YYYY'), 15, '[]'::jsonb, false),
  ('7', 'Customer Portal', 'Testing Company', 30, 'at-risk', TO_CHAR(CURRENT_DATE + INTERVAL '60 days', 'Mon DD, YYYY'), 22, '[]'::jsonb, false),
  ('8', 'API Integration', 'Testing Company', 85, 'on-track', TO_CHAR(CURRENT_DATE + INTERVAL '10 days', 'Mon DD, YYYY'), 10, '[]'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, client = EXCLUDED.client, progress = EXCLUDED.progress, status = EXCLUDED.status, "dueDate" = EXCLUDED."dueDate", "taskCount" = EXCLUDED."taskCount", "isOverdue" = EXCLUDED."isOverdue";

DELETE FROM project_memberships WHERE "projectId" IN ('1', '2', '3', '4', '5', '6', '7', '8');
INSERT INTO project_memberships ("projectId", "memberId", role)
VALUES
  ('1', '1', 'member'), ('1', '2', 'member'), ('1', '3', 'member'), ('1', '4', 'member'), ('1', '10', 'guest'),
  ('2', '2', 'member'), ('2', '5', 'member'), ('2', '6', 'member'),
  ('3', '3', 'member'), ('3', '7', 'member'), ('3', '10', 'guest'),
  ('4', '1', 'member'), ('4', '4', 'member'), ('4', '8', 'member'),
  ('5', '5', 'member'),
  ('6', '2', 'member'), ('6', '3', 'member'), ('6', '6', 'member'),
  ('7', '1', 'member'), ('7', '4', 'member'), ('7', '5', 'member'), ('7', '8', 'member'),
  ('8', '2', 'member'), ('8', '6', 'member');
