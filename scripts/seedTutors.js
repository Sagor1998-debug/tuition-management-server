console.log("MONGODB_URI =", process.env.MONGODB_URI);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

// ===============================
// TUTORS DATA
// ===============================
const tutors = [
  {"name":"Dr. Abdul Karim","email":"tutor.abdul.karim1@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345001","photoUrl":"https://randomuser.me/api/portraits/men/101.jpg","qualifications":"PhD Physics, University of Dhaka","experience":"15 years teaching HSC & admission coaching"},
  {"name":"Prof. Sharmeen Akhter","email":"tutor.sharmeen.akhter2@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345002","photoUrl":"https://randomuser.me/api/portraits/women/102.jpg","qualifications":"MSc Mathematics, Jahangirnagar University","experience":"12 years tutoring SSC/HSC"},
  {"name":"Dr. Tanvir Hasan","email":"tutor.tanvir.hasan3@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345003","photoUrl":"https://randomuser.me/api/portraits/men/103.jpg","qualifications":"PhD Chemistry, RU","experience":"10 years university & admission prep"},
  {"name":"Mariam Sultana","email":"tutor.mariam.sultana4@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345004","photoUrl":"https://randomuser.me/api/portraits/women/104.jpg","qualifications":"MA English, DU","experience":"8 years English language & literature"},
  {"name":"Engr. Kamrul Islam","email":"tutor.kamrul.islam5@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345005","photoUrl":"https://randomuser.me/api/portraits/men/105.jpg","qualifications":"BSc Engineering, BUET","experience":"7 years math & physics for engineering"},
  {"name":"Dr. Fatema Noor","email":"tutor.fatema.noor6@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345006","photoUrl":"https://randomuser.me/api/portraits/women/106.jpg","qualifications":"PhD Botany, DU","experience":"14 years biology tutoring"},
  {"name":"Mahmudur Rahman","email":"tutor.mahmudur.rahman7@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345007","photoUrl":"https://randomuser.me/api/portraits/men/107.jpg","qualifications":"MBA Finance, NSU","experience":"9 years business studies"},
  {"name":"Dr. Nusrat Hossain","email":"tutor.nusrat.hossain8@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345008","photoUrl":"https://randomuser.me/api/portraits/women/108.jpg","qualifications":"PhD Economics, DU","experience":"11 years economics & BCS prep"},
  {"name":"Md. Aminul Haque","email":"tutor.aminul.haque9@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345009","photoUrl":"https://randomuser.me/api/portraits/men/109.jpg","qualifications":"MA Bangla, RU","experience":"10 years Bangla 1st & 2nd paper"},
  {"name":"Samia Khatun","email":"tutor.samia.khatun10@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345010","photoUrl":"https://randomuser.me/api/portraits/women/110.jpg","qualifications":"BSc Statistics, DU","experience":"6 years statistics & ICT"},
  {"name":"Dr. Rakibul Hasan","email":"tutor.rakibul.hasan11@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345011","photoUrl":"https://randomuser.me/api/portraits/men/111.jpg","qualifications":"PhD Mathematics, DU","experience":"13 years math olympiad & HSC coaching"},
  {"name":"Farzana Akter","email":"tutor.farzana.akter12@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345012","photoUrl":"https://randomuser.me/api/portraits/women/112.jpg","qualifications":"MSc Botany, RU","experience":"6 years biology tutoring"},
  {"name":"Engr. Shakil Ahmed","email":"tutor.shakil.ahmed13@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345013","photoUrl":"https://randomuser.me/api/portraits/men/113.jpg","qualifications":"EEE, KUET","experience":"8 years physics & ICT"},
  {"name":"Dr. Jannatul Ferdous","email":"tutor.jannatul.ferdous14@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345014","photoUrl":"https://randomuser.me/api/portraits/women/114.jpg","qualifications":"PhD Sociology, DU","experience":"10 years social science coaching"},
  {"name":"Faisal Hossain","email":"tutor.faisal.hossain15@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345015","photoUrl":"https://randomuser.me/api/portraits/men/115.jpg","qualifications":"MBA Marketing, IBA","experience":"7 years business studies"},
  {"name":"Dr. Shaila Rahman","email":"tutor.shaila.rahman16@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345016","photoUrl":"https://randomuser.me/api/portraits/women/116.jpg","qualifications":"PhD Psychology, DU","experience":"12 years psychology & counseling"},
  {"name":"Md. Tareq Aziz","email":"tutor.tareq.aziz17@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345017","photoUrl":"https://randomuser.me/api/portraits/men/117.jpg","qualifications":"BBA Accounting, DU","experience":"6 years accounting tutoring"},
  {"name":"Dr. Lubna Islam","email":"tutor.lubna.islam18@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345018","photoUrl":"https://randomuser.me/api/portraits/women/118.jpg","qualifications":"PhD Microbiology, DU","experience":"9 years biology & microbiology"},
  {"name":"Arifur Rahman","email":"tutor.arifur.rahman19@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345019","photoUrl":"https://randomuser.me/api/portraits/men/119.jpg","qualifications":"MA English Literature, JU","experience":"8 years SSC/HSC English"},
  {"name":"Sadia Sultana","email":"tutor.sadia.sultana20@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345020","photoUrl":"https://randomuser.me/api/portraits/women/120.jpg","qualifications":"MA Islamic Studies, IU","experience":"6 years Islamic studies"},
  {"name":"Dr. Rezaul Karim","email":"tutor.rezaul.karim21@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345021","photoUrl":"https://randomuser.me/api/portraits/men/121.jpg","qualifications":"PhD Zoology, CU","experience":"14 years biology"},
  {"name":"Sultana Yasmin","email":"tutor.sultana.yasmin22@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345022","photoUrl":"https://randomuser.me/api/portraits/women/122.jpg","qualifications":"MA Social Work, RU","experience":"7 years social science"},
  {"name":"Engr. Mahfuz Hasan","email":"tutor.mahfuz.hasan23@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345023","photoUrl":"https://randomuser.me/api/portraits/men/123.jpg","qualifications":"CSE, BUET","experience":"9 years ICT & programming"},
  {"name":"Dr. Labiba Khan","email":"tutor.labiba.khan24@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345024","photoUrl":"https://randomuser.me/api/portraits/women/124.jpg","qualifications":"PhD Linguistics, DU","experience":"11 years English & linguistics"},
  {"name":"Ismail Hossain","email":"tutor.ismail.hossain25@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345025","photoUrl":"https://randomuser.me/api/portraits/men/125.jpg","qualifications":"MSc Geography, RU","experience":"7 years geography"},
  {"name":"Dr. Anika Tania","email":"tutor.anika.tania26@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345026","photoUrl":"https://randomuser.me/api/portraits/women/126.jpg","qualifications":"PhD Education, DU","experience":"12 years education training"},
  {"name":"Md. Shahin Alam","email":"tutor.shahin.alam27@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345027","photoUrl":"https://randomuser.me/api/portraits/men/127.jpg","qualifications":"BSc Physics, RUET","experience":"6 years physics tutoring"},
  {"name":"Dr. Umme Habiba","email":"tutor.umme.habiba28@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345028","photoUrl":"https://randomuser.me/api/portraits/women/128.jpg","qualifications":"PhD Economics, DU","experience":"10 years economics"},
  {"name":"Shahidul Islam","email":"tutor.shahidul.islam29@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345029","photoUrl":"https://randomuser.me/api/portraits/men/129.jpg","qualifications":"MBA HRM, NSU","experience":"8 years business & BBA coaching"},
  {"name":"Maliha Jahan","email":"tutor.maliha.jahan30@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345030","photoUrl":"https://randomuser.me/api/portraits/women/130.jpg","qualifications":"BSc Environmental Science, JU","experience":"5 years environmental science"},
  {"name":"Dr. Towhid Hasan","email":"tutor.towhid.hasan31@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345031","photoUrl":"https://randomuser.me/api/portraits/men/131.jpg","qualifications":"PhD Applied Physics, DU","experience":"15 years physics"},
  {"name":"Jarin Tasnim","email":"tutor.jarin.tasnim32@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345032","photoUrl":"https://randomuser.me/api/portraits/women/132.jpg","qualifications":"MA English, NU","experience":"6 years English tutoring"},
  {"name":"Omar Faruk","email":"tutor.omar.faruk33@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345033","photoUrl":"https://randomuser.me/api/portraits/men/133.jpg","qualifications":"BBA Finance, DU","experience":"6 years business studies"},
  {"name":"Dr. Rubaba Noor","email":"tutor.rubaba.noor34@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345034","photoUrl":"https://randomuser.me/api/portraits/women/134.jpg","qualifications":"PhD Pharmacy, DU","experience":"9 years biology & chemistry"},
  {"name":"Hasan Mahmud","email":"tutor.hasan.mahmud35@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345035","photoUrl":"https://randomuser.me/api/portraits/men/135.jpg","qualifications":"BSc Mathematics, RU","experience":"7 years math coaching"},
  {"name":"Dr. Samira Islam","email":"tutor.samira.islam36@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345036","photoUrl":"https://randomuser.me/api/portraits/women/136.jpg","qualifications":"PhD Sociology, JU","experience":"11 years SSC/HSC social science"},
  {"name":"Arman Hossain","email":"tutor.arman.hossain37@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345037","photoUrl":"https://randomuser.me/api/portraits/men/137.jpg","qualifications":"MSc Economics, RU","experience":"6 years economics"},
  {"name":"Dr. Rimu Sultana","email":"tutor.rimu.sultana38@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345038","photoUrl":"https://randomuser.me/api/portraits/women/138.jpg","qualifications":"PhD Biotechnology, DU","experience":"8 years biology"},
  {"name":"Jahirul Haque","email":"tutor.jahirul.haque39@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345039","photoUrl":"https://randomuser.me/api/portraits/men/139.jpg","qualifications":"MA History, DU","experience":"5 years history"},
  {"name":"Sumaya Rahman","email":"tutor.sumaya.rahman40@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345040","photoUrl":"https://randomuser.me/api/portraits/women/140.jpg","qualifications":"MSc Psychology, RU","experience":"6 years psychology"},
  {"name":"Dr. Kamrul Ahsan","email":"tutor.kamrul.ahsan41@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345041","photoUrl":"https://randomuser.me/api/portraits/men/141.jpg","qualifications":"PhD Mechanical Engineering","experience":"10 years engineering math"},
  {"name":"Fahmida Khatun","email":"tutor.fahmida.khatun42@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345042","photoUrl":"https://randomuser.me/api/portraits/women/142.jpg","qualifications":"MA Philosophy, DU","experience":"7 years philosophy"},
  {"name":"Dr. Samiul Islam","email":"tutor.samiul.islam43@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345043","photoUrl":"https://randomuser.me/api/portraits/men/143.jpg","qualifications":"PhD Genetics, CU","experience":"12 years biology"},
  {"name":"Nadia Noor","email":"tutor.nadia.noor44@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345044","photoUrl":"https://randomuser.me/api/portraits/women/144.jpg","qualifications":"MA English, BRAC University","experience":"5 years English coaching"},
  {"name":"Rafid Ahmed","email":"tutor.rafid.ahmed45@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345045","photoUrl":"https://randomuser.me/api/portraits/men/145.jpg","qualifications":"BSc Chemistry, DU","experience":"6 years chemistry tutoring"},
  {"name":"Dr. Tahmina Akter","email":"tutor.tahmina.akter46@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345046","photoUrl":"https://randomuser.me/api/portraits/women/146.jpg","qualifications":"PhD Political Science","experience":"10 years civics & social science"},
  {"name":"Alim Uddin","email":"tutor.alim.uddin47@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345047","photoUrl":"https://randomuser.me/api/portraits/men/147.jpg","qualifications":"MA Arabic, IU","experience":"8 years Arabic & Islamic studies"},
  {"name":"Dr. Roksana Jahan","email":"tutor.roksana.jahan48@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345048","photoUrl":"https://randomuser.me/api/portraits/women/148.jpg","qualifications":"PhD Marketing, DU","experience":"10 years business studies"},
  {"name":"Sajid Hossain","email":"tutor.sajid.hossain49@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345049","photoUrl":"https://randomuser.me/api/portraits/men/149.jpg","qualifications":"BSc ICT, UIU","experience":"5 years ICT tutoring"},
  {"name":"Mehnaz Sultana","email":"tutor.mehnaz.sultana50@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345050","photoUrl":"https://randomuser.me/api/portraits/women/150.jpg","qualifications":"MSc Chemistry, RU","experience":"7 years chemistry"},
  {"name":"Dr. Imran Chowdhury","email":"tutor.imran.chowdhury51@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345051","photoUrl":"https://randomuser.me/api/portraits/men/151.jpg","qualifications":"PhD Computer Science","experience":"10 years CSE & programming"},
  {"name":"Fariha Rahman","email":"tutor.fariha.rahman52@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345052","photoUrl":"https://randomuser.me/api/portraits/women/152.jpg","qualifications":"MA English, JU","experience":"6 years English language"},
  {"name":"Dr. Monirul Islam","email":"tutor.monirul.islam53@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345053","photoUrl":"https://randomuser.me/api/portraits/men/153.jpg","qualifications":"PhD Statistics","experience":"9 years math & statistics"},
  {"name":"Rumana Ahmed","email":"tutor.rumana.ahmed54@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345054","photoUrl":"https://randomuser.me/api/portraits/women/154.jpg","qualifications":"BEd Education, DU","experience":"6 years school-level teaching"},
  {"name":"Dr. Sohel Rana","email":"tutor.sohel.rana55@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345055","photoUrl":"https://randomuser.me/api/portraits/men/155.jpg","qualifications":"PhD History, DU","experience":"11 years history"},
  {"name":"Jannat Fatema","email":"tutor.jannat.fatema56@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345056","photoUrl":"https://randomuser.me/api/portraits/women/156.jpg","qualifications":"MA Bangla, RU","experience":"6 years Bangla"},
  {"name":"Dr. Selim Mahmud","email":"tutor.selim.mahmud57@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345057","photoUrl":"https://randomuser.me/api/portraits/men/157.jpg","qualifications":"PhD Philosophy","experience":"10 years philosophy"},
  {"name":"Samira Noor","email":"tutor.samira.noor58@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345058","photoUrl":"https://randomuser.me/api/portraits/women/158.jpg","qualifications":"MSc Zoology, DU","experience":"7 years biology"},
  {"name":"Arif Chowdhury","email":"tutor.arif.chowdhury59@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345059","photoUrl":"https://randomuser.me/api/portraits/men/159.jpg","qualifications":"MSc Geography, DU","experience":"6 years geography"},
  {"name":"Sadia Hossain","email":"tutor.sadia.hossain60@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345060","photoUrl":"https://randomuser.me/api/portraits/women/160.jpg","qualifications":"BSc Psychology, NSU","experience":"5 years psychology"},
  {"name":"Dr. Amin Hasan","email":"tutor.amin.hasan61@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345061","photoUrl":"https://randomuser.me/api/portraits/men/161.jpg","qualifications":"PhD Chemistry","experience":"12 years chemistry"},
  {"name":"Muntaha Akter","email":"tutor.muntaha.akter62@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345062","photoUrl":"https://randomuser.me/api/portraits/women/162.jpg","qualifications":"MA English","experience":"5 years English"},
  {"name":"Dr. Rashidul Islam","email":"tutor.rashidul.islam63@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345063","photoUrl":"https://randomuser.me/api/portraits/men/163.jpg","qualifications":"PhD Physics","experience":"10 years physics"},
  {"name":"Nusrat Nafisa","email":"tutor.nusrat.nafisa64@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345064","photoUrl":"https://randomuser.me/api/portraits/women/164.jpg","qualifications":"MSS Sociology","experience":"6 years sociology"},
  {"name":"Shakib Rahman","email":"tutor.shakib.rahman65@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345065","photoUrl":"https://randomuser.me/api/portraits/men/165.jpg","qualifications":"BBA Finance","experience":"5 years business studies"},
  {"name":"Dr. Maisha Akter","email":"tutor.maisha.akter66@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345066","photoUrl":"https://randomuser.me/api/portraits/women/166.jpg","qualifications":"PhD Biotechnology","experience":"8 years biology"},
  {"name":"Ridwan Ahmed","email":"tutor.ridwan.ahmed67@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345067","photoUrl":"https://randomuser.me/api/portraits/men/167.jpg","qualifications":"MSc ICT","experience":"6 years ICT"},
  {"name":"Dr. Faria Sultana","email":"tutor.faria.sultana68@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345068","photoUrl":"https://randomuser.me/api/portraits/women/168.jpg","qualifications":"PhD Food Science","experience":"7 years biology & food science"},
  {"name":"Jahid Hasan","email":"tutor.jahid.hasan69@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345069","photoUrl":"https://randomuser.me/api/portraits/men/169.jpg","qualifications":"BSc Physics","experience":"5 years physics"},
  {"name":"Samia Noor","email":"tutor.samia.noor70@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345070","photoUrl":"https://randomuser.me/api/portraits/women/170.jpg","qualifications":"MA English","experience":"5 years English"},
  {"name":"Dr. Hasanul Karim","email":"tutor.hasanul.karim71@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345071","photoUrl":"https://randomuser.me/api/portraits/men/171.jpg","qualifications":"PhD Mathematics","experience":"10 years math"},
  {"name":"Fahmida Sultana","email":"tutor.fahmida.sultana72@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345072","photoUrl":"https://randomuser.me/api/portraits/women/172.jpg","qualifications":"MA English","experience":"6 years SSC/HSC English"},
  {"name":"Dr. Kabir Ahmed","email":"tutor.kabir.ahmed73@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345073","photoUrl":"https://randomuser.me/api/portraits/men/173.jpg","qualifications":"PhD Chemistry","experience":"9 years chemistry"},
  {"name":"Madiha Jahan","email":"tutor.madiha.jahan74@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345074","photoUrl":"https://randomuser.me/api/portraits/women/174.jpg","qualifications":"MSS Political Science","experience":"6 years civics"},
  {"name":"Sajjad Hossain","email":"tutor.sajjad.hossain75@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345075","photoUrl":"https://randomuser.me/api/portraits/men/175.jpg","qualifications":"MBA Accounting","experience":"7 years commerce"},
  {"name":"Dr. Lamea Tasnim","email":"tutor.lamea.tasnim76@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345076","photoUrl":"https://randomuser.me/api/portraits/women/176.jpg","qualifications":"PhD Microbiology","experience":"9 years biology"},
  {"name":"Tanvir Ahamed","email":"tutor.tanvir.ahamed77@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345077","photoUrl":"https://randomuser.me/api/portraits/men/177.jpg","qualifications":"BSc CSE","experience":"5 years ICT"},
  {"name":"Dr. Rafia Hasan","email":"tutor.rafia.hasan78@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345078","photoUrl":"https://randomuser.me/api/portraits/women/178.jpg","qualifications":"PhD English","experience":"10 years English literature"},
  {"name":"Shahriar Kabir","email":"tutor.shahriar.kabir79@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345079","photoUrl":"https://randomuser.me/api/portraits/men/179.jpg","qualifications":"MSc Physics","experience":"7 years physics"},
  {"name":"Muna Tasnim","email":"tutor.muna.tasnim80@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345080","photoUrl":"https://randomuser.me/api/portraits/women/180.jpg","qualifications":"MA Bangla","experience":"5 years Bangla"},
  {"name":"Dr. Tanima Noor","email":"tutor.tanima.noor81@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345081","photoUrl":"https://randomuser.me/api/portraits/women/181.jpg","qualifications":"PhD Sociology","experience":"9 years sociology"},
  {"name":"Asif Rahman","email":"tutor.asif.rahman82@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345082","photoUrl":"https://randomuser.me/api/portraits/men/182.jpg","qualifications":"BSc Math","experience":"5 years math"},
  {"name":"Dr. Nowshin Akter","email":"tutor.nowshin.akter83@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345083","photoUrl":"https://randomuser.me/api/portraits/women/183.jpg","qualifications":"PhD Botany","experience":"8 years botany"},
  {"name":"Sazzad Karim","email":"tutor.sazzad.karim84@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345084","photoUrl":"https://randomuser.me/api/portraits/men/184.jpg","qualifications":"BBA Finance","experience":"6 years business"},
  {"name":"Farzana Noor","email":"tutor.farzana.noor85@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345085","photoUrl":"https://randomuser.me/api/portraits/women/185.jpg","qualifications":"MA English","experience":"6 years English"},
  {"name":"Dr. Arafat Hossain","email":"tutor.arafat.hossain86@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345086","photoUrl":"https://randomuser.me/api/portraits/men/186.jpg","qualifications":"PhD Physics","experience":"11 years physics"},
  {"name":"Shaila Ahmed","email":"tutor.shaila.ahmed87@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345087","photoUrl":"https://randomuser.me/api/portraits/women/187.jpg","qualifications":"BSc Statistics","experience":"6 years statistics"},
  {"name":"Dr. Moksed Ali","email":"tutor.moksed.ali88@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345088","photoUrl":"https://randomuser.me/api/portraits/men/188.jpg","qualifications":"PhD Economics","experience":"10 years economics"},
  {"name":"Mahira Sultana","email":"tutor.mahira.sultana89@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345089","photoUrl":"https://randomuser.me/api/portraits/women/189.jpg","qualifications":"MA English","experience":"4 years English"},
  {"name":"Rashidul Karim","email":"tutor.rashidul.karim90@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345090","photoUrl":"https://randomuser.me/api/portraits/men/190.jpg","qualifications":"BSc Physics","experience":"5 years physics"},
  {"name":"Dr. Tamanna Haque","email":"tutor.tamanna.haque91@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345091","photoUrl":"https://randomuser.me/api/portraits/women/191.jpg","qualifications":"PhD Microbiology","experience":"9 years biology"},
  {"name":"Yasir Arafat","email":"tutor.yasir.arafat92@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345092","photoUrl":"https://randomuser.me/api/portraits/men/192.jpg","qualifications":"MBA Marketing","experience":"6 years business studies"},
  {"name":"Dr. Nusaiba Anjum","email":"tutor.nusaiba.anjum93@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345093","photoUrl":"https://randomuser.me/api/portraits/women/193.jpg","qualifications":"PhD Biochemistry","experience":"7 years biology"},
  {"name":"Mubin Hasan","email":"tutor.mubin.hasan94@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345094","photoUrl":"https://randomuser.me/api/portraits/men/194.jpg","qualifications":"BSc ICT","experience":"5 years ICT"},
  {"name":"Dr. Anna Rahman","email":"tutor.anna.rahman95@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345095","photoUrl":"https://randomuser.me/api/portraits/women/195.jpg","qualifications":"PhD Psychology","experience":"8 years psychology"},
  {"name":"Sharif Islam","email":"tutor.sharif.islam96@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345096","photoUrl":"https://randomuser.me/api/portraits/men/196.jpg","qualifications":"MA English","experience":"5 years English"},
  {"name":"Dr. Liyana Akter","email":"tutor.liyana.akter97@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345097","photoUrl":"https://randomuser.me/api/portraits/women/197.jpg","qualifications":"PhD Chemistry","experience":"8 years chemistry"},
  {"name":"Afsar Uddin","email":"tutor.afsar.uddin98@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345098","photoUrl":"https://randomuser.me/api/portraits/men/198.jpg","qualifications":"MBA Finance","experience":"6 years commerce"},
  {"name":"Sumaiya Haque","email":"tutor.sumaiya.haque99@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345099","photoUrl":"https://randomuser.me/api/portraits/women/199.jpg","qualifications":"MA English","experience":"4 years SSC/HSC English"},
  {"name":"Dr. Nadim Chowdhury","email":"tutor.nadim.chowdhury100@tuition.com","password":"Tutor123!@#","role":"tutor","phone":"+8801712345100","photoUrl":"https://randomuser.me/api/portraits/men/200.jpg","qualifications":"PhD Applied Physics","experience":"12 years physics"}
];

// ===============================
// SEED FUNCTION
// ===============================
async function seedTutors() {
  try {
    // 1️⃣ Connect to MongoDB
   await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 2️⃣ Remove existing tutors ONLY
    const deleted = await User.deleteMany({ role: 'tutor' });
    console.log(`🗑️ Deleted ${deleted.deletedCount} existing tutors`);

    // 3️⃣ Insert tutors
    for (const tutor of tutors) {
      const hashedPassword = await bcrypt.hash(tutor.password, 10);

      await User.create({
        name: tutor.name,
        email: tutor.email,
        password: hashedPassword,
        role: 'tutor',
        phone: tutor.phone,
        photoUrl: tutor.photoUrl,
        qualifications: tutor.qualifications,
        experience: tutor.experience
      });
    }

    console.log(`🎉 Successfully seeded ${tutors.length} tutors`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Tutor seeding failed:', error.message);
    process.exit(1);
  }
}

seedTutors();
