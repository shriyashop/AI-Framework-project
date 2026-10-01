-- seed data. reloaded from the live extract 2026-09-01, PII scrubbed by finance.
-- DO NOT re-run against prod. (it truncates)

DELETE FROM employees;
DELETE FROM claims;
DELETE FROM claim_lines;
DELETE FROM audit_log;

INSERT INTO employees (id, emp_no, full_name, email, department, cost_centre, manager_id, is_director, late_claim_waiver, active, joined_dt) VALUES
 (1,'EMP001','Margaret Okonkwo','m.okonkwo@northgate-inds.example','Finance','FIN-100',NULL,1,0,1,'2009-04-06'),
 (2,'EMP002','David Chen','d.chen@northgate-inds.example','Sales','SLS-200',6,0,0,1,'2014-09-15'),
 (3,'EMP003','Priya Raman','p.raman@northgate-inds.example','R&D','RD-410',6,0,0,1,'2016-01-11'),
 (4,'EMP004','Tomasz Nowak','t.nowak@northgate-inds.example','R&D','RD-420',6,0,1,1,'2012-07-02'),
 (5,'EMP005','Aisha Bello','a.bello@northgate-inds.example','Marketing','MKT-300',6,0,0,1,'2018-03-19'),
 (6,'EMP006','Stuart Fairbairn','s.fairbairn@northgate-inds.example','Operations','OPS-500',8,0,0,1,'2010-11-01'),
 (7,'EMP007','Yuki Tanaka','y.tanaka@northgate-inds.example','Sales','SLS-210',2,0,1,1,'2020-06-08'),
 (8,'EMP008','Robert Vance','r.vance@northgate-inds.example','Executive','EXE-001',NULL,1,1,1,'2007-02-26');

INSERT INTO claims (id, claim_ref, employee_id, expense_dt, submitted_dt, category, cost_centre, description, amount, currency, has_receipt, status, approval_route, approver_id, decided_dt, notes, created_at) VALUES
 (1 ,'EC-2026-0001',2,'2026-08-12','2026-08-14','TRAVEL'    ,'SLS-200','Rail fare London-Leeds, Harlow account visit'      ,  84.40,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-17',NULL,'2026-08-14 09:12:00'),
 (2 ,'EC-2026-0002',2,'2026-08-12','2026-08-14','MEALS'     ,'SLS-200','Lunch, on site all day'                            ,  22.10,'GBP',0,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-17',NULL,'2026-08-14 09:14:00'),
 (3 ,'EC-2026-0003',5,'2026-08-20','2026-08-21','SUPPLIES'  ,'MKT-300','Printer toner (black) for the stand printer'       ,  75.00,'GBP',0,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-24',NULL,'2026-08-21 15:40:00'),
 (4 ,'EC-2026-0004',5,'2026-08-20','2026-08-22','SUPPLIES'  ,'MKT-300','Foam boards for expo stand'                        ,  75.01,'GBP',0,'REJECTED'   ,''         ,NULL,'2026-08-22','Receipt required.','2026-08-22 08:05:00'),
 (5 ,'EC-2026-0005',6,'2026-07-30','2026-08-03','ACCOM'     ,'OPS-500','Hotel Birmingham, 2 nights, NEC site visit'        , 500.00,'GBP',1,'APPROVED'   ,'MGR:8'    ,8   ,'2026-08-05',NULL,'2026-08-03 07:55:00'),
 (6 ,'EC-2026-0006',6,'2026-07-30','2026-08-03','ACCOM'     ,'OPS-500','Hotel Birmingham, extra night, NEC overrun'        , 500.01,'GBP',1,'PENDING_DIR','MGR:8|DIR',NULL,NULL,NULL,'2026-08-03 07:58:00'),
 (7 ,'EC-2026-0007',3,'2026-08-01','2026-08-05','SOFTWARE'  ,'RD-410' ,'JetBrains All Products Pack x3 renewal'            ,1290.00,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-07',NULL,'2026-08-05 11:02:00'),
 (8 ,'EC-2026-0008',3,'2026-08-02','2026-08-06','SUPPLIES'  ,'RD-410' ,'Oscilloscope probe set, lab bench 2'               , 940.00,'GBP',0,'REJECTED'   ,''         ,NULL,'2026-08-06','Receipt required.','2026-08-06 10:31:00'),
 (9 ,'EC-2026-0009',6,'2025-03-27','2026-04-08','TRAVEL'    ,'OPS-500','Taxi fares, FY24/25 year end site audits'          , 118.00,'GBP',1,'APPROVED'   ,'MGR:8'    ,8   ,'2026-04-10','Passed to FY25/26 per FIN.','2026-04-08 16:20:00'),
 (10,'EC-2026-0010',5,'2026-03-24','2026-04-10','MEALS'     ,'MKT-300','Team lunch, year end wrap'                         ,  61.00,'GBP',0,'APPROVED'   ,'MGR:6'    ,6   ,'2026-04-13',NULL,'2026-04-10 12:44:00'),
 (11,'EC-2026-0011',5,'2025-03-30','2026-04-15','SUPPLIES'  ,'MKT-300','Exhibition banner, found in the storage cupboard'  , 240.00,'GBP',1,'REJECTED'   ,''         ,NULL,'2026-04-15','Claim submitted outside the allowed period.','2026-04-15 09:01:00'),
 (12,'EC-2026-0012',2,'2026-05-05','2026-08-03','MEALS'     ,'SLS-200','Breakfast, early start Gatwick'                    ,  45.00,'GBP',0,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-06',NULL,'2026-08-03 06:40:00'),
 (13,'EC-2026-0013',2,'2026-05-04','2026-08-03','MEALS'     ,'SLS-200','Dinner, Gatwick overnight'                         ,  47.50,'GBP',0,'REJECTED'   ,''         ,NULL,'2026-08-03','Claim submitted outside the allowed period.','2026-08-03 06:42:00'),
 (14,'EC-2026-0014',7,'2026-01-15','2026-08-25','TRAVEL'    ,'SLS-210','Airport parking, Osaka trip'                       , 180.00,'GBP',1,'APPROVED'   ,'MGR:2'    ,2   ,'2026-08-27','Waiver on file.','2026-08-25 17:10:00'),
 (15,'EC-2026-0015',4,'2026-02-10','2026-08-20','TRAVEL'    ,'RD-420' ,'Rail, standards committee Coventry'                , 320.00,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-24','Waiver on file.','2026-08-20 13:26:00'),
 (16,'EC-2026-0016',2,'2026-08-18','2026-08-19','CLIENT_ENT','SLS-200','Coffees with buyer, Costa Reading'                 ,  10.00,'GBP',0,'PENDING_DIR','MGR:6|DIR',NULL,NULL,NULL,'2026-08-19 10:03:00'),
 (17,'EC-2026-0017',7,'2026-08-21','2026-08-24','CLIENT_ENT','SLS-210','Drinks after product demo'                         ,  42.50,'GBP',0,'PENDING_DIR','MGR:2|DIR',NULL,NULL,NULL,'2026-08-24 09:37:00'),
 (18,'EC-2026-0018',3,'2026-07-14','2026-07-16','CLIENT_ENT','RD-410' ,'Dinner with Bristol Univ partner team'             , 310.00,'GBP',1,'APPROVED'   ,'MGR:6|DIR',1   ,'2026-07-22',NULL,'2026-07-16 08:49:00'),
 (19,'EC-2026-0019',6,'2026-06-11','2026-06-12','CLIENT_ENT','OPS-500','Hospitality box, supplier day'                     ,1150.00,'GBP',1,'APPROVED'   ,'MGR:8|DIR',8   ,'2026-06-20',NULL,'2026-06-12 14:15:00'),
 (20,'EC-2026-0020',1,'2026-08-05','2026-08-06','TRAVEL'    ,'FIN-100','Taxi to external audit meeting'                    ,  31.20,'GBP',1,'APPROVED'   ,''         ,8   ,'2026-08-08',NULL,'2026-08-06 18:22:00'),
 (21,'EC-2026-0021',8,'2026-07-02','2026-07-03','TRAVEL'    ,'EXE-001','Flights, board meeting Zurich'                     ,1420.00,'GBP',1,'APPROVED'   ,''         ,NULL,'2026-07-04',NULL,'2026-07-03 07:30:00'),
 (22,'EC-2026-0022',4,'2026-08-11','2026-08-12','SUPPLIES'  ,'RD-420' ,'Soldering iron tips, bulk pack'                    ,  46.80,'GBP',0,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-14',NULL,'2026-08-12 09:55:00'),
 (23,'EC-2026-0023',4,'2026-08-11','2026-08-12','SOFTWARE'  ,'RD-420' ,'Altium licence top-up, seat 4'                     ,2200.00,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-08-14',NULL,'2026-08-12 09:58:00'),
 (24,'EC-2026-0024',5,'2026-07-07','2026-07-09','TRAINING'  ,'MKT-300','CIM digital marketing short course'                , 690.00,'GBP',1,'APPROVED'   ,'MGR:6|DIR',1   ,'2026-07-15',NULL,'2026-07-09 11:20:00'),
 (25,'EC-2026-0025',6,'2026-05-19','2026-05-20','MILEAGE'   ,'OPS-500','Mileage, 214mi @ 0.45'                             ,  96.30,'GBP',1,'APPROVED'   ,'MGR:8'    ,8   ,'2026-05-22','Mileage log attached in lieu of receipt.','2026-05-20 17:44:00'),
 (26,'EC-2026-0026',2,'2026-06-03','2026-06-04','TRAVEL'    ,'SLS-200','Rail, Manchester'                                  , 128.00,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-06-06',NULL,'2026-06-04 08:11:00'),
 (27,'EC-2026-0027',2,'2026-06-03','2026-06-04','ACCOM'     ,'SLS-200','Premier Inn Manchester, 1 night'                   ,  89.00,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-06-06',NULL,'2026-06-04 08:13:00'),
 (28,'EC-2026-0028',7,'2026-06-22','2026-06-23','MEALS'     ,'SLS-210','Client site, sandwiches for the install team'      ,  34.75,'GBP',0,'APPROVED'   ,'MGR:2'    ,2   ,'2026-06-25',NULL,'2026-06-23 16:02:00'),
 (29,'EC-2026-0029',7,'2026-07-30','2026-08-01','TRAVEL'    ,'SLS-210','Taxi, Heathrow to office'                          ,  68.00,'GBP',0,'APPROVED'   ,'MGR:2'    ,2   ,'2026-08-03',NULL,'2026-08-01 21:18:00'),
 (30,'EC-2026-0030',3,'2026-05-12','2026-05-13','TRAINING'  ,'RD-410' ,'Embedded systems conference ticket'                , 545.00,'GBP',1,'APPROVED'   ,'MGR:6'    ,6   ,'2026-05-15',NULL,'2026-05-13 10:07:00'),
 (31,'EC-2026-0031',5,'2026-04-28','2026-04-29','SUPPLIES'  ,'MKT-300','Roller banners x2'                                 , 318.00,'GBP',1,'APPROVED'   ,'MGR:6|DIR',1   ,'2026-05-06',NULL,'2026-04-29 13:33:00'),
 (32,'EC-2026-0032',6,'2026-04-02','2026-04-03','SUPPLIES'  ,'OPS-500','Warehouse shelving brackets'                       ,  74.99,'GBP',0,'APPROVED'   ,'MGR:8'    ,8   ,'2026-04-06',NULL,'2026-04-03 09:29:00'),
 (33,'EC-2026-0033',4,'2026-09-01','2026-09-02','SUPPLIES'  ,'RD-420' ,'USB protocol analysers x2'                         , 210.00,'GBP',1,'PENDING_MGR','MGR:6'    ,NULL,NULL,NULL,'2026-09-02 08:40:00'),
 (34,'EC-2026-0034',2,'2026-09-02','2026-09-03','CLIENT_ENT','SLS-200','Lunch, renewal negotiation'                        ,  96.00,'GBP',1,'PENDING_DIR','MGR:6|DIR',NULL,NULL,NULL,'2026-09-03 12:01:00'),
 (35,'EC-2026-0035',5,'2026-08-28','2026-08-29','MEALS'     ,'MKT-300','Evening meal, late expo teardown'                  ,  27.40,'GBP',0,'APPROVED'   ,'MGR:6'    ,6   ,'2026-09-01',NULL,'2026-08-29 20:55:00'),
 (36,'EC-2026-0036',6,'2026-08-30','2026-09-04','ACCOM'     ,'OPS-500','Travelodge Hull, 3 nights'                         , 231.00,'GBP',1,'PAID'       ,'MGR:8'    ,8   ,'2026-09-05',NULL,'2026-09-04 07:05:00'),
 (37,'EC-2026-0037',3,'2026-02-14','2026-06-10','SUPPLIES'  ,'RD-410' ,'Bench PSU repair parts'                            ,  88.00,'GBP',1,'REJECTED'   ,''         ,NULL,'2026-06-10','Claim submitted outside the allowed period.','2026-06-10 15:12:00'),
 (38,'EC-2026-0038',1,'2026-06-18','2026-06-19','TRAINING'  ,'FIN-100','ICAEW CPD day'                                     , 415.00,'GBP',1,'APPROVED'   ,''         ,NULL,'2026-06-20',NULL,'2026-06-19 09:00:00'),
 (39,'EC-2026-0039',8,'2026-08-19','2026-08-20','CLIENT_ENT','EXE-001','Dinner, investor relations'                        , 780.00,'GBP',1,'PENDING_DIR','DIR'      ,NULL,NULL,NULL,'2026-08-20 08:15:00'),
 (40,'EC-2026-0040',7,'2026-03-11','2026-04-02','TRAVEL'    ,'SLS-210','Ferry and fuel, Dublin roadshow'                   , 402.00,'GBP',1,'APPROVED'   ,'MGR:2'    ,2   ,'2026-04-06',NULL,'2026-04-02 18:47:00');

INSERT INTO claim_lines (id, claim_id, line_desc, line_amt, vat_amt) VALUES
 (1,5,'Room, night 1',250.00,41.66),
 (2,5,'Room, night 2',250.00,41.66),
 (3,19,'Box hire',900.00,150.00),
 (4,19,'Catering',250.00,41.66),
 (5,23,'Licence seat 4',2200.00,366.66);

INSERT INTO audit_log (id, claim_id, actor, action, detail, ts) VALUES
 (1,4 ,'SYSTEM','AUTO_REJECT','no receipt','2026-08-22 08:05:01'),
 (2,8 ,'SYSTEM','AUTO_REJECT','no receipt','2026-08-06 10:31:02'),
 (3,11,'SYSTEM','AUTO_REJECT','age','2026-04-15 09:01:01'),
 (4,13,'SYSTEM','AUTO_REJECT','age','2026-08-03 06:42:01'),
 (5,37,'SYSTEM','AUTO_REJECT','age','2026-06-10 15:12:01'),
 (6,9 ,'SYSTEM','ACCEPT','ye window','2026-04-08 16:20:01'),
 (7,18,'m.okonkwo','APPROVE','','2026-07-22 09:30:00'),
 (8,36,'FIN_BATCH','PAY','BACS run 2026-09-05','2026-09-05 02:00:00');
