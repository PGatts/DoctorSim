import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@doctorsim.com' },
    update: {},
    create: {
      email: 'admin@doctorsim.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', admin.email);

  // Create sample patient
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: patientPassword,
      name: 'Test Patient',
      role: 'PATIENT'
    }
  });
  console.log('Patient user created:', patient.email);

  // Helper to create question with options
  async function createQuestion(data: any) {
    const { answerOptions, ...questionData } = data;
    return await prisma.question.create({
      data: {
        ...questionData,
        answerOptions: {
          create: answerOptions
        }
      }
    });
  }

  console.log('Creating 40 medication, preventative care, and nutrition questions...');
  
  // ============ MEDICATION MANAGEMENT QUESTIONS (15) ============
  
  // Question 1: Antibiotic completion
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You\'re taking antibiotics for a sinus infection. After 3 days, you feel much better. Should you stop taking the medication?',
    patientContext: 'Patient on antibiotics feeling improved',
    patientName: 'Amanda',
    patientAge: 32,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about antibiotic resistance and complete treatment.',
    answerOptions: [
      { optionText: 'No - finish the entire prescribed course even if you feel better', isCorrect: true, explanation: 'Stopping antibiotics early can lead to antibiotic resistance and infection recurrence. Complete the full course.' },
      { optionText: 'Yes - save the rest for the next time you\'re sick', isCorrect: false, explanation: 'Never save antibiotics. Each infection requires proper diagnosis and specific treatment.' },
      { optionText: 'Stop and give remaining pills to a family member who\'s sick', isCorrect: false, explanation: 'Never share prescription medications. Each person needs their own evaluation and prescription.' },
      { optionText: 'Yes - continuing wastes money if you already feel better', isCorrect: false, explanation: 'Stopping early risks incomplete treatment, resistance, and relapse - costing more long-term.' }
    ]
  });

  // Question 2: Blood thinner and diet
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You take warfarin (Coumadin) and your doctor mentions watching your vitamin K intake. Why does this matter?',
    patientContext: 'Patient on blood thinner learning about food interactions',
    patientName: 'George',
    patientAge: 68,
    difficultyLevel: 'ADVANCED',
    hintText: 'Vitamin K affects how warfarin works in your body.',
    answerOptions: [
      { optionText: 'Vitamin K reduces warfarin\'s effectiveness; maintain consistent intake, don\'t drastically increase or decrease', isCorrect: true, explanation: 'Vitamin K counteracts warfarin. Consistency is key - sudden changes affect INR levels and clotting risk.' },
      { optionText: 'You must completely avoid all foods containing vitamin K', isCorrect: false, explanation: 'Elimination isn\'t necessary. Consistent intake allows for proper dose adjustment. Sudden changes cause problems.' },
      { optionText: 'Vitamin K has no interaction with warfarin', isCorrect: false, explanation: 'Vitamin K directly affects warfarin metabolism and effectiveness. It\'s a significant drug-nutrient interaction.' },
      { optionText: 'Eat as much leafy greens as possible to boost warfarin', isCorrect: false, explanation: 'Actually the opposite - large amounts of leafy greens (high in vitamin K) can reduce warfarin\'s effect.' }
    ]
  });

  // Question 3: Medication timing
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Your prescription says "take twice daily." You forgot your morning dose. It\'s now 4 PM. What should you do?',
    patientContext: 'Patient missed medication dose',
    patientName: 'Lisa',
    patientAge: 45,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Consider spacing between doses and when the next dose is due.',
    answerOptions: [
      { optionText: 'Take it now, then take your evening dose at the regular time (or slightly later to space them)', isCorrect: true, explanation: 'Generally, take a missed dose when you remember unless it\'s almost time for the next dose. Don\'t double up.' },
      { optionText: 'Take double the dose at your next scheduled time', isCorrect: false, explanation: 'Never double doses. This can cause dangerous side effects or overdose.' },
      { optionText: 'Skip it entirely and continue with your regular schedule', isCorrect: false, explanation: 'If there\'s still time before your next dose, it\'s usually better to take the missed dose.' },
      { optionText: 'Take three doses tomorrow to make up for it', isCorrect: false, explanation: 'Never try to "catch up" on missed doses. This risks overdose and dangerous side effects.' }
    ]
  });

  // Question 4: OTC pain medication safety
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You\'re taking prescription ibuprofen for arthritis. You have a headache. Can you take additional over-the-counter ibuprofen?',
    patientContext: 'Patient on prescription NSAIDs with additional pain',
    patientName: 'Robert',
    patientAge: 58,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Prescription and OTC versions of the same drug are still the same drug.',
    answerOptions: [
      { optionText: 'No - you\'re already at prescribed dose; adding OTC ibuprofen risks overdose and serious side effects', isCorrect: true, explanation: 'Prescription and OTC ibuprofen are the same drug. Taking both can cause dangerous overdose, stomach bleeding, and kidney damage.' },
      { optionText: 'Yes - OTC and prescription medications never interact', isCorrect: false, explanation: 'OTC and prescription versions of the same drug DO interact. You\'d be taking a double dose.' },
      { optionText: 'Yes - as long as they\'re different brands', isCorrect: false, explanation: 'Brand names don\'t matter. Ibuprofen is ibuprofen regardless of brand or prescription status.' },
      { optionText: 'Yes - OTC doses are too small to matter', isCorrect: false, explanation: 'OTC ibuprofen is the same medication. Taking both exceeds safe daily limits.' }
    ]
  });

  // Question 5: Grapefruit and medications
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Your cholesterol medication bottle has a warning about grapefruit. Why?',
    patientContext: 'Patient on statins learning about food interactions',
    patientName: 'Sandra',
    patientAge: 62,
    difficultyLevel: 'ADVANCED',
    hintText: 'Grapefruit affects how the body processes certain medications.',
    answerOptions: [
      { optionText: 'Grapefruit blocks enzymes that break down the medication, causing dangerous high levels in your blood', isCorrect: true, explanation: 'Grapefruit inhibits CYP3A4 enzyme, preventing normal medication breakdown. This causes levels to accumulate dangerously.' },
      { optionText: 'Grapefruit makes the medication work faster, which is beneficial', isCorrect: false, explanation: 'Faster isn\'t better here - grapefruit causes excessive drug levels, increasing side effect and toxicity risk.' },
      { optionText: 'This is an old myth with no scientific basis', isCorrect: false, explanation: 'Grapefruit-drug interactions are well-documented and can be dangerous with many medications.' },
      { optionText: 'Only grapefruit juice matters, not the actual fruit', isCorrect: false, explanation: 'Both grapefruit juice and the fruit contain compounds that interfere with drug metabolism.' }
    ]
  });

  // Question 6: Expiration dates
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You found a bottle of pain medication that expired 2 years ago. Is it safe to take?',
    patientContext: 'Person with expired medication',
    patientName: 'Michael',
    patientAge: 39,
    difficultyLevel: 'BEGINNER',
    hintText: 'Consider both effectiveness and safety after expiration.',
    answerOptions: [
      { optionText: 'No - expired medications may be less effective or potentially harmful; dispose of them properly', isCorrect: true, explanation: 'Expired medications lose potency and can develop harmful breakdown products. Use current medications only.' },
      { optionText: 'Yes - expiration dates are just suggestions, not requirements', isCorrect: false, explanation: 'Expiration dates indicate when manufacturers guarantee full potency and safety. Beyond this, drugs degrade.' },
      { optionText: 'Yes - medications stay good forever if stored in a cool place', isCorrect: false, explanation: 'Even with proper storage, medications break down over time. Two years past expiration is too old.' },
      { optionText: 'Yes - just take twice the dose to compensate for reduced strength', isCorrect: false, explanation: 'This is dangerous. You can\'t predict potency loss, and doubling creates overdose risk.' }
    ]
  });

  // Question 7: Medication storage
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Where should you NOT store most medications?',
    patientContext: 'Patient learning proper medication storage',
    patientName: 'Patricia',
    patientAge: 51,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about humidity, heat, and common storage mistakes.',
    answerOptions: [
      { optionText: 'In the bathroom medicine cabinet - heat and humidity degrade medications', isCorrect: true, explanation: 'Bathrooms have heat and moisture that break down medications. Store in a cool, dry place like a bedroom drawer.' },
      { optionText: 'In the original labeled bottle', isCorrect: false, explanation: 'Original bottles are ideal - they protect from light, have dosing instructions, and identify the medication.' },
      { optionText: 'In a cool, dry place away from sunlight', isCorrect: false, explanation: 'This is actually the CORRECT place to store medications. Cool, dry, and dark is ideal.' },
      { optionText: 'Out of reach of children', isCorrect: false, explanation: 'Keeping medications away from children is essential for safety, not a storage mistake.' }
    ]
  });

  // Question 8: Drug-drug interaction
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You take an SSRI antidepressant. Your doctor prescribes a new medication. What should you ask?',
    patientContext: 'Patient on antidepressant getting additional medication',
    patientName: 'Jennifer',
    patientAge: 36,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Multiple medications can interact in dangerous ways.',
    answerOptions: [
      { optionText: 'Does this interact with my current medications? SSRIs have many potential interactions.', isCorrect: true, explanation: 'SSRIs interact with many drugs (pain meds, migraine drugs, other antidepressants). Always ask about interactions.' },
      { optionText: 'Nothing - doctors automatically check everything', isCorrect: false, explanation: 'While doctors check, they need accurate lists. You\'re your best advocate. Always mention all medications.' },
      { optionText: 'Only worry about interactions if both medications are prescriptions', isCorrect: false, explanation: 'OTC medications, supplements, and herbal products also interact. Mention everything you take.' },
      { optionText: 'Interactions only matter if medications are from different pharmacies', isCorrect: false, explanation: 'Drug interactions happen in your body regardless of where you bought them. Using one pharmacy helps catch issues though.' }
    ]
  });

  // Question 9: Taking medication with food
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Your prescription says "take on an empty stomach." What does this mean?',
    patientContext: 'Patient learning about medication timing with meals',
    patientName: 'James',
    patientAge: 44,
    difficultyLevel: 'BEGINNER',
    hintText: 'Empty stomach has a specific timing definition.',
    answerOptions: [
      { optionText: '1 hour before eating or 2-3 hours after eating', isCorrect: true, explanation: 'Empty stomach typically means 1 hour before or 2-3 hours after meals for optimal absorption.' },
      { optionText: 'Right before you eat your meal', isCorrect: false, explanation: 'This isn\'t empty stomach. Food in your stomach can interfere with medication absorption.' },
      { optionText: 'Anytime as long as you haven\'t eaten in the last 5 minutes', isCorrect: false, explanation: 'Five minutes isn\'t enough. Food affects medication absorption for hours.' },
      { optionText: 'Only first thing in the morning before breakfast', isCorrect: false, explanation: 'While morning works, "empty stomach" applies any time you meet the before/after meal timing.' }
    ]
  });

  // Question 10: Supplements and prescriptions
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Should you tell your doctor about vitamins, supplements, and herbal products you take?',
    patientContext: 'Patient taking various supplements',
    patientName: 'Karen',
    patientAge: 49,
    difficultyLevel: 'BEGINNER',
    hintText: 'Consider whether "natural" products can affect prescribed medications.',
    answerOptions: [
      { optionText: 'Yes - supplements can interact with medications and affect treatment', isCorrect: true, explanation: 'Supplements, vitamins, and herbs can interact with prescriptions. St. John\'s Wort, ginkgo, and many others affect medications.' },
      { optionText: 'No - supplements are natural and don\'t count as real medications', isCorrect: false, explanation: '"Natural" doesn\'t mean safe or interaction-free. Many supplements significantly affect medications.' },
      { optionText: 'Only mention supplements if you take more than 10 different ones', isCorrect: false, explanation: 'Even one supplement can interact. Mention everything, regardless of quantity.' },
      { optionText: 'Only if you bought them at a pharmacy', isCorrect: false, explanation: 'Where you bought them doesn\'t affect interactions. Supplements from anywhere can interact with medications.' }
    ]
  });

  // Question 11: Liquid medication measurement
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Your child\'s antibiotic says "give 5 mL twice daily." You don\'t have a medicine cup. What should you do?',
    patientContext: 'Parent needing to measure liquid medication',
    patientName: 'Maria',
    patientAge: 33,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Accurate measurement is crucial for proper dosing.',
    answerOptions: [
      { optionText: 'Call the pharmacy for a dosing syringe or cup - kitchen spoons are not accurate', isCorrect: true, explanation: 'Kitchen teaspoons vary in size (3-7mL). Use pharmacy-provided syringes or cups for accurate dosing.' },
      { optionText: 'Use a regular kitchen teaspoon - it\'s close enough', isCorrect: false, explanation: 'Kitchen spoons vary significantly and can lead to under or overdosing. This isn\'t safe for precise medication.' },
      { optionText: 'Estimate the amount by eyeballing it', isCorrect: false, explanation: 'Eyeballing medication doses is dangerous, especially for children. Precise measurement prevents under/overdosing.' },
      { optionText: 'Give double the dose to make sure it works', isCorrect: false, explanation: 'Never adjust prescribed doses. This causes serious side effects or toxicity.' }
    ]
  });

  // Question 12: Birth control and antibiotics
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You take birth control pills and your doctor prescribed antibiotics for an infection. What should you know?',
    patientContext: 'Woman on oral contraceptives prescribed antibiotics',
    patientName: 'Emily',
    patientAge: 28,
    difficultyLevel: 'ADVANCED',
    hintText: 'Some antibiotics can reduce contraceptive effectiveness.',
    answerOptions: [
      { optionText: 'Most antibiotics don\'t affect birth control, but rifampin does; use backup contraception if prescribed rifampin', isCorrect: true, explanation: 'Contrary to myth, most antibiotics don\'t reduce pill effectiveness. Rifampin (for TB) is the main exception requiring backup.' },
      { optionText: 'All antibiotics make birth control completely ineffective', isCorrect: false, explanation: 'Most antibiotics don\'t significantly affect birth control. The interaction is less common than believed.' },
      { optionText: 'Antibiotics have no interaction with birth control ever', isCorrect: false, explanation: 'While rare, rifampin and some anti-seizure drugs do reduce effectiveness. Always ask your doctor.' },
      { optionText: 'You must stop birth control while taking any antibiotic', isCorrect: false, explanation: 'Never stop birth control without doctor guidance. Continue pills and add backup if advised.' }
    ]
  });

  // Question 13: Medication adherence
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You often forget to take your daily blood pressure medication. What\'s the best strategy?',
    patientContext: 'Patient struggling with medication adherence',
    patientName: 'Donald',
    patientAge: 56,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about ways to build medication into your daily routine.',
    answerOptions: [
      { optionText: 'Link it to a daily habit (like brushing teeth), use a pill organizer, or set phone alarms', isCorrect: true, explanation: 'Habit stacking, visual reminders, and alarms significantly improve adherence. Consistency in timing helps too.' },
      { optionText: 'Skip doses when you forget - your body needs breaks from medication', isCorrect: false, explanation: 'Blood pressure medications require consistent daily use. Skipping doses causes dangerous BP fluctuations.' },
      { optionText: 'Take multiple doses at once when you remember', isCorrect: false, explanation: 'Never take multiple doses together. This causes dangerous peaks in medication levels.' },
      { optionText: 'Stop taking it since you can\'t remember anyway', isCorrect: false, explanation: 'Untreated high blood pressure causes stroke and heart disease. Find adherence strategies rather than stopping.' }
    ]
  });

  // Question 14: Chewing or crushing pills
  await createQuestion({
    category: 'Medication Management',
    questionText: 'You have trouble swallowing large pills. Can you crush or open all capsules?',
    patientContext: 'Patient with difficulty swallowing medications',
    patientName: 'Dorothy',
    patientAge: 71,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Some medications have special coatings that affect how they work.',
    answerOptions: [
      { optionText: 'No - extended-release and enteric-coated pills must not be crushed; ask pharmacist about each medication', isCorrect: true, explanation: 'Crushing time-release or coated pills releases full dose at once (dangerous) or destroys protective coating. Ask about alternatives.' },
      { optionText: 'Yes - all pills can safely be crushed or opened', isCorrect: false, explanation: 'Many medications have special formulations. Crushing can cause overdose, stomach upset, or medication failure.' },
      { optionText: 'Only crush pills if you dissolve them in water first', isCorrect: false, explanation: 'Water doesn\'t solve the problem. The issue is destroying time-release or protective mechanisms.' },
      { optionText: 'Cutting pills in half is always safe even if crushing isn\'t', isCorrect: false, explanation: 'Cutting has the same issues. Some pills have scored lines for splitting; others should never be divided.' }
    ]
  });

  // Question 15: Alcohol and medications
  await createQuestion({
    category: 'Medication Management',
    questionText: 'Your medication bottle says "avoid alcohol." What could happen if you drink while taking it?',
    patientContext: 'Patient questioning alcohol warning on medication',
    patientName: 'Charles',
    patientAge: 47,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Alcohol can interact dangerously with many medications.',
    answerOptions: [
      { optionText: 'Increased side effects, dangerous interactions, liver damage, or reduced medication effectiveness', isCorrect: true, explanation: 'Alcohol magnifies side effects (drowsiness, dizziness), can cause dangerous interactions, and stresses the liver processing medications.' },
      { optionText: 'Nothing serious - warnings are overly cautious', isCorrect: false, explanation: 'These warnings exist for serious reasons. Alcohol-medication interactions can be life-threatening.' },
      { optionText: 'Only a problem if you drink more than a six-pack', isCorrect: false, explanation: 'Even small amounts of alcohol can interact. "Avoid alcohol" typically means complete avoidance.' },
      { optionText: 'The medication just won\'t work, but there\'s no danger', isCorrect: false, explanation: 'Beyond reduced effectiveness, alcohol can cause serious harm including respiratory depression, liver damage, or excessive sedation.' }
    ]
  });

  // ============ PREVENTIVE CARE QUESTIONS (13) ============

  // Question 16: Colonoscopy timing
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'At what age should average-risk adults start getting colonoscopies for colon cancer screening?',
    patientContext: 'Person asking about cancer screening guidelines',
    patientName: 'Steven',
    patientAge: 43,
    difficultyLevel: 'BEGINNER',
    hintText: 'Recent guidelines lowered the starting age from 50.',
    answerOptions: [
      { optionText: 'Age 45, then every 10 years if normal (or sooner if family history)', isCorrect: true, explanation: 'Updated guidelines recommend starting at 45 for average risk. Earlier screening needed with family history or symptoms.' },
      { optionText: 'Age 60 - younger people don\'t get colon cancer', isCorrect: false, explanation: 'Colon cancer rates are rising in younger adults. Screening starts at 45 to catch early disease.' },
      { optionText: 'Only if you have symptoms like blood in stool', isCorrect: false, explanation: 'That\'s diagnostic testing, not screening. Screening finds cancer before symptoms appear, when most curable.' },
      { optionText: 'Never - colonoscopies are unnecessary', isCorrect: false, explanation: 'Colonoscopy saves lives by finding and removing precancerous polyps. It\'s one of the most effective cancer screenings.' }
    ]
  });

  // Question 17: Dental checkup frequency
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'How often should you visit the dentist for checkups and cleanings if you have no dental problems?',
    patientContext: 'Person maintaining good oral health',
    patientName: 'Michelle',
    patientAge: 35,
    difficultyLevel: 'BEGINNER',
    hintText: 'Regular dental visits prevent problems from developing.',
    answerOptions: [
      { optionText: 'Every 6 months for most people', isCorrect: true, explanation: 'Twice-yearly visits allow early detection of cavities, gum disease, and oral cancer while keeping teeth clean.' },
      { optionText: 'Once every 5 years is sufficient', isCorrect: false, explanation: 'Five years is far too long. Dental problems develop and worsen in this time, requiring more extensive treatment.' },
      { optionText: 'Only when you have tooth pain', isCorrect: false, explanation: 'Waiting for pain means problems are advanced. Prevention and early detection save teeth and money.' },
      { optionText: 'Brushing well means you never need to go', isCorrect: false, explanation: 'Even with perfect home care, professional cleanings remove tartar and checkups catch problems early.' }
    ]
  });

  // Question 18: Skin cancer self-exam
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'When doing a skin self-exam for melanoma, what changes should prompt a doctor visit?',
    patientContext: 'Person learning melanoma warning signs',
    patientName: 'Brian',
    patientAge: 52,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Remember the ABCDE rule for melanoma detection.',
    answerOptions: [
      { optionText: 'Asymmetry, Border irregularity, Color variation, Diameter >6mm, or Evolution/changing moles', isCorrect: true, explanation: 'The ABCDE rule helps identify suspicious moles. Any of these features warrants evaluation, especially changes over time.' },
      { optionText: 'Only moles that hurt or bleed', isCorrect: false, explanation: 'Early melanoma often doesn\'t hurt or bleed. Visual changes (ABCDE) are more important warning signs.' },
      { optionText: 'All moles should be removed regardless of appearance', isCorrect: false, explanation: 'Most moles are benign. Only suspicious or changing moles need evaluation and possible removal.' },
      { optionText: 'Only moles on sun-exposed areas matter', isCorrect: false, explanation: 'Melanoma can occur anywhere, including areas rarely exposed to sun. Check your entire body.' }
    ]
  });

  // Question 19: Blood pressure monitoring
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re 35 with no health problems. How often should your blood pressure be checked?',
    patientContext: 'Young healthy adult asking about screening frequency',
    patientName: 'Angela',
    patientAge: 35,
    difficultyLevel: 'BEGINNER',
    hintText: 'Regular monitoring catches hypertension before it causes damage.',
    answerOptions: [
      { optionText: 'At least every 2 years if normal, more often if elevated', isCorrect: true, explanation: 'Adults should have BP checked every 1-2 years if normal. High blood pressure is often symptomless but treatable.' },
      { optionText: 'Only after age 60', isCorrect: false, explanation: 'High blood pressure can develop at any age. Early detection allows lifestyle changes before medication is needed.' },
      { optionText: 'Only if you feel dizzy or have headaches', isCorrect: false, explanation: 'High blood pressure is usually asymptomatic. Relying on symptoms means missing this "silent killer."' },
      { optionText: 'Once at age 35, then not again until age 50', isCorrect: false, explanation: 'Blood pressure can change over months to years. Regular monitoring catches increases early.' }
    ]
  });

  // Question 20: Bone density screening
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'At what age should women start bone density screening for osteoporosis?',
    patientContext: 'Woman asking about osteoporosis screening',
    patientName: 'Barbara',
    patientAge: 59,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Post-menopausal women are at highest risk for bone loss.',
    answerOptions: [
      { optionText: 'Age 65 for average risk women; earlier if risk factors like early menopause or fractures', isCorrect: true, explanation: 'Screening at 65 catches osteoporosis before fractures occur. Earlier screening needed with risk factors.' },
      { optionText: 'Age 80 - only the very elderly need this test', isCorrect: false, explanation: 'Waiting until 80 misses the opportunity to prevent fractures. Screening starts at 65 when treatment can prevent breaks.' },
      { optionText: 'Never - osteoporosis is a normal part of aging', isCorrect: false, explanation: 'While common, osteoporosis is not inevitable. Treatment significantly reduces fracture risk.' },
      { optionText: 'Age 30 for all women', isCorrect: false, explanation: 'This is too early for average-risk women. Osteoporosis develops with age, especially after menopause.' }
    ]
  });

  // Question 21: HPV vaccine timing
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'At what age is the HPV vaccine most effective and routinely recommended?',
    patientContext: 'Parent asking about vaccination timing',
    patientName: 'Rebecca',
    patientAge: 41,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The vaccine works best before exposure to HPV.',
    answerOptions: [
      { optionText: 'Ages 11-12 (can start at 9); also recommended through age 26 if not previously vaccinated', isCorrect: true, explanation: 'HPV vaccine is most effective before sexual activity begins. Preteens are the ideal age, but catch-up vaccination helps through 26.' },
      { optionText: 'Only adults over 30 should get it', isCorrect: false, explanation: 'Actually the opposite - it\'s most effective in preteens and teens before HPV exposure.' },
      { optionText: 'Age 65 and older', isCorrect: false, explanation: 'HPV vaccine isn\'t recommended for older adults. It works best before exposure, typically in youth.' },
      { optionText: 'The vaccine is only for women', isCorrect: false, explanation: 'HPV vaccine is recommended for both boys and girls. It prevents cancers in both sexes.' }
    ]
  });

  // Question 22: Diabetes screening
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re 47, overweight, with a family history of diabetes. Should you be screened?',
    patientContext: 'Person with diabetes risk factors',
    patientName: 'Timothy',
    patientAge: 47,
    difficultyLevel: 'BEGINNER',
    hintText: 'Risk factors warrant earlier and more frequent screening.',
    answerOptions: [
      { optionText: 'Yes - with risk factors, screening should start at age 35-40 and repeat every 3 years', isCorrect: true, explanation: 'Overweight adults with family history should be screened earlier and more frequently than average-risk individuals.' },
      { optionText: 'No - only people with symptoms need diabetes screening', isCorrect: false, explanation: 'Type 2 diabetes often has no symptoms early on. Screening catches it when lifestyle changes are most effective.' },
      { optionText: 'Wait until age 65 to start screening', isCorrect: false, explanation: 'With risk factors, waiting until 65 misses years of opportunity for prevention and early treatment.' },
      { optionText: 'No - family history doesn\'t increase your risk', isCorrect: false, explanation: 'Family history significantly increases diabetes risk. Combined with excess weight, screening is important.' }
    ]
  });

  // Question 23: Shingles vaccine
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'At what age should you get the shingles vaccine?',
    patientContext: 'Older adult asking about vaccination',
    patientName: 'Helen',
    patientAge: 54,
    difficultyLevel: 'BEGINNER',
    hintText: 'The vaccine is recommended for adults in their 50s.',
    answerOptions: [
      { optionText: 'Age 50 or older; Shingrix (2-dose series) is recommended even if you\'ve had shingles before', isCorrect: true, explanation: 'Shingrix is recommended at 50+. You should get it even with prior shingles since it can recur.' },
      { optionText: 'Only if you\'ve never had chickenpox', isCorrect: false, explanation: 'Shingles vaccine is specifically for people who HAD chickenpox. The virus stays dormant and can reactivate as shingles.' },
      { optionText: 'Age 30 - the earlier the better', isCorrect: false, explanation: 'Shingles risk increases significantly with age. Vaccine is recommended starting at 50.' },
      { optionText: 'Never needed if you already had shingles', isCorrect: false, explanation: 'Shingles can recur. Vaccination is recommended even with previous shingles to prevent future episodes.' }
    ]
  });

  // Question 24: Eye exam frequency
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re 55 with no vision problems. How often should you have a comprehensive eye exam?',
    patientContext: 'Middle-aged adult asking about eye care',
    patientName: 'Richard',
    patientAge: 55,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Glaucoma and other eye diseases become more common with age.',
    answerOptions: [
      { optionText: 'Every 1-2 years; annual exams recommended after age 60', isCorrect: true, explanation: 'After 50, eye exams should be more frequent to detect glaucoma, macular degeneration, and cataracts early.' },
      { optionText: 'Once every 10 years is sufficient', isCorrect: false, explanation: 'This is too infrequent, especially after 40. Many eye diseases develop silently and need regular monitoring.' },
      { optionText: 'Only if you need glasses or have trouble seeing', isCorrect: false, explanation: 'Eye exams check for diseases (glaucoma, macular degeneration) that have no early symptoms.' },
      { optionText: 'Never - vision problems are just normal aging', isCorrect: false, explanation: 'While some changes are normal, many are treatable. Regular exams prevent vision loss from treatable conditions.' }
    ]
  });

  // Question 25: Tetanus booster
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'How often do adults need a tetanus booster shot?',
    patientContext: 'Adult asking about vaccination schedule',
    patientName: 'Nancy',
    patientAge: 38,
    difficultyLevel: 'BEGINNER',
    hintText: 'Tetanus immunity wanes over time and needs boosting.',
    answerOptions: [
      { optionText: 'Every 10 years; sooner if you have a dirty wound and it\'s been over 5 years', isCorrect: true, explanation: 'Tdap or Td booster every 10 years maintains immunity. Dirty wounds may need earlier boosting.' },
      { optionText: 'Once in childhood, then never again', isCorrect: false, explanation: 'Tetanus immunity decreases over time. Adults need boosters every 10 years to maintain protection.' },
      { optionText: 'Only if you step on a rusty nail', isCorrect: false, explanation: 'Waiting for an injury is too late. Regular boosters prevent tetanus from any wound.' },
      { optionText: 'Every year like the flu shot', isCorrect: false, explanation: 'Tetanus boosters last about 10 years, unlike flu vaccines which are needed annually.' }
    ]
  });

  // Question 26: Prostate screening discussion
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re a 52-year-old man. Should you get PSA screening for prostate cancer?',
    patientContext: 'Man asking about prostate cancer screening',
    patientName: 'Kenneth',
    patientAge: 52,
    difficultyLevel: 'ADVANCED',
    hintText: 'PSA screening is controversial and should be discussed with your doctor.',
    answerOptions: [
      { optionText: 'Discuss pros and cons with your doctor; screening is an individual decision based on risk factors and preferences', isCorrect: true, explanation: 'PSA has benefits and harms. Guidelines recommend informed decision-making with your doctor, considering your values and risk.' },
      { optionText: 'Yes - all men over 50 must get annual PSA tests', isCorrect: false, explanation: 'PSA screening isn\'t mandatory. It can find slow-growing cancers that may never cause harm, leading to overtreatment.' },
      { optionText: 'No - PSA screening is never recommended', isCorrect: false, explanation: 'It\'s not never recommended - it\'s a personal decision. Some men benefit, especially those at higher risk.' },
      { optionText: 'Only get screened if you have symptoms', isCorrect: false, explanation: 'Symptoms mean diagnostic testing, not screening. Screening finds cancer before symptoms, but the decision is nuanced.' }
    ]
  });

  // Question 27: Lung cancer screening
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re 58 and smoked a pack a day for 25 years but quit 3 years ago. Should you be screened for lung cancer?',
    patientContext: 'Former heavy smoker asking about screening',
    patientName: 'Linda',
    patientAge: 58,
    difficultyLevel: 'ADVANCED',
    hintText: 'Lung cancer screening is recommended for high-risk current and former smokers.',
    answerOptions: [
      { optionText: 'Yes - you meet criteria for annual low-dose CT screening (ages 50-80, 20+ pack-years, quit within 15 years)', isCorrect: true, explanation: 'You have significant smoking history and quit recently. Annual LDCT can detect lung cancer early when most treatable.' },
      { optionText: 'No - only current smokers need screening', isCorrect: false, explanation: 'Former smokers remain at high risk for years after quitting. Screening includes those who quit within 15 years.' },
      { optionText: 'No - chest X-rays are sufficient for screening', isCorrect: false, explanation: 'Chest X-rays miss too many early cancers. Low-dose CT is the recommended screening method.' },
      { optionText: 'Wait until you have symptoms like cough or weight loss', isCorrect: false, explanation: 'Symptoms often mean advanced cancer. Screening finds cancer early when treatment outcomes are much better.' }
    ]
  });

  // Question 28: Pap smear frequency
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re 35 with normal Pap smears. How often do you need cervical cancer screening?',
    patientContext: 'Woman asking about screening frequency',
    patientName: 'Elizabeth',
    patientAge: 35,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Guidelines changed - annual Paps are no longer recommended.',
    answerOptions: [
      { optionText: 'Every 3 years with Pap alone, or every 5 years with Pap plus HPV test', isCorrect: true, explanation: 'After 30, you can do Pap every 3 years or co-testing every 5 years. Annual screening is no longer recommended.' },
      { optionText: 'Every year without exception', isCorrect: false, explanation: 'Updated guidelines recommend less frequent screening. Annual Paps don\'t improve outcomes and increase false positives.' },
      { optionText: 'Never - Pap smears are outdated', isCorrect: false, explanation: 'Pap smears remain the gold standard for cervical cancer screening, which is highly effective.' },
      { optionText: 'Once every 10 years', isCorrect: false, explanation: 'This is too infrequent. Every 3-5 years (depending on test type) is the recommended interval.' }
    ]
  });

  // ============ DIET & NUTRITION QUESTIONS (12) ============

  // Question 29: Sodium intake limits
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'What\'s the recommended daily sodium limit for most adults?',
    patientContext: 'Person trying to reduce sodium for blood pressure',
    patientName: 'Joseph',
    patientAge: 51,
    difficultyLevel: 'BEGINNER',
    hintText: 'Most Americans consume far more than recommended amounts.',
    answerOptions: [
      { optionText: 'Less than 2,300 mg per day (about 1 teaspoon of salt)', isCorrect: true, explanation: 'The recommended limit is 2,300mg daily, though 1,500mg is ideal for those with hypertension. Most Americans consume 3,400mg.' },
      { optionText: 'Less than 500 mg per day', isCorrect: false, explanation: 'This is too low and difficult to achieve. The body needs some sodium, and 2,300mg is the recommended upper limit.' },
      { optionText: '5,000 mg per day - the more the better', isCorrect: false, explanation: 'High sodium increases blood pressure and heart disease risk. Less is better for most people.' },
      { optionText: 'Unlimited - sodium has no health effects', isCorrect: false, explanation: 'Excess sodium raises blood pressure, increasing stroke and heart disease risk. Intake should be limited.' }
    ]
  });

  // Question 30: Added sugar limits
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'The American Heart Association recommends limiting added sugars to what amount daily?',
    patientContext: 'Person trying to reduce sugar intake',
    patientName: 'Susan',
    patientAge: 43,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'This is much less than what most people consume.',
    answerOptions: [
      { optionText: 'Women: 25g (6 teaspoons); Men: 36g (9 teaspoons) per day', isCorrect: true, explanation: 'These limits help prevent obesity, diabetes, and heart disease. One soda often exceeds the entire daily limit.' },
      { optionText: '100g per day - plenty of room for sweets', isCorrect: false, explanation: 'This is far too high and would significantly increase disease risk. Recommended limits are much lower.' },
      { optionText: 'No limit - natural and added sugars are the same', isCorrect: false, explanation: 'Added sugars provide calories without nutrients. Natural sugars in whole foods come with fiber and nutrients.' },
      { optionText: 'Only diabetics need to limit sugar', isCorrect: false, explanation: 'Everyone benefits from limiting added sugar to prevent obesity, diabetes, heart disease, and dental problems.' }
    ]
  });

  // Question 31: Fiber intake importance
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You want to increase your fiber intake. What\'s the daily recommended amount and why is it important?',
    patientContext: 'Person learning about fiber benefits',
    patientName: 'Carol',
    patientAge: 47,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Most Americans don\'t get enough fiber for digestive and heart health.',
    answerOptions: [
      { optionText: '25-30g daily; fiber aids digestion, lowers cholesterol, controls blood sugar, and promotes fullness', isCorrect: true, explanation: 'Fiber has multiple benefits. Most Americans only get 15g daily. Increase gradually to avoid gas and bloating.' },
      { optionText: '5g daily - too much fiber is harmful', isCorrect: false, explanation: 'Five grams is far too low. Fiber is beneficial at recommended amounts and difficult to overdo with whole foods.' },
      { optionText: 'Fiber has no health benefits and isn\'t necessary', isCorrect: false, explanation: 'Fiber is crucial for digestive health, disease prevention, and satiety. Low-fiber diets increase many disease risks.' },
      { optionText: '100g daily - more is always better', isCorrect: false, explanation: 'While beneficial, 100g is excessive and can cause bloating and interfere with nutrient absorption. 25-30g is ideal.' }
    ]
  });

  // Question 32: Healthy fats
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'Which type of fat should you limit most to reduce heart disease risk?',
    patientContext: 'Person trying to improve diet for heart health',
    patientName: 'Frank',
    patientAge: 59,
    difficultyLevel: 'BEGINNER',
    hintText: 'Not all fats are equally harmful - one type is particularly bad.',
    answerOptions: [
      { optionText: 'Trans fats (partially hydrogenated oils) - avoid completely', isCorrect: true, explanation: 'Trans fats raise bad cholesterol, lower good cholesterol, and significantly increase heart disease risk. They should be eliminated.' },
      { optionText: 'Monounsaturated fats from olive oil and avocados', isCorrect: false, explanation: 'These are heart-healthy fats that should be included. They improve cholesterol and reduce inflammation.' },
      { optionText: 'Omega-3 fats from fish and walnuts', isCorrect: false, explanation: 'Omega-3s are anti-inflammatory and protective for the heart. They should be increased, not limited.' },
      { optionText: 'All fats are equally bad and should be eliminated', isCorrect: false, explanation: 'Some fats are essential and beneficial. Trans fats should be avoided, but healthy fats are important.' }
    ]
  });

  // Question 33: Protein requirements
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You\'re 65 and want to maintain muscle mass. How much protein do you need daily?',
    patientContext: 'Older adult concerned about muscle loss',
    patientName: 'Margaret',
    patientAge: 65,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Older adults need more protein than younger people to preserve muscle.',
    answerOptions: [
      { optionText: '1.0-1.2 grams per kilogram body weight; spread throughout the day with each meal', isCorrect: true, explanation: 'Older adults need more protein than the standard RDA to prevent sarcopenia. Distribute intake across meals for best results.' },
      { optionText: 'Only 10g per day - too much protein damages kidneys', isCorrect: false, explanation: 'Ten grams is far too low and would cause severe muscle wasting. Higher protein is safe for healthy kidneys.' },
      { optionText: 'Protein needs decrease with age', isCorrect: false, explanation: 'Actually the opposite - older adults need MORE protein to maintain muscle mass and strength.' },
      { optionText: 'Only bodybuilders need to think about protein intake', isCorrect: false, explanation: 'Everyone needs adequate protein, especially older adults to prevent muscle loss and maintain function.' }
    ]
  });

  // Question 34: Portion control
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'What\'s a simple way to control portion sizes without measuring?',
    patientContext: 'Person trying to manage weight through portion control',
    patientName: 'Gary',
    patientAge: 44,
    difficultyLevel: 'BEGINNER',
    hintText: 'Use familiar objects as visual guides for portions.',
    answerOptions: [
      { optionText: 'Use your hand: palm = protein serving, fist = carb serving, thumb = fat serving', isCorrect: true, explanation: 'Hand portions are portable and personalized to your size. This makes portion control practical anywhere.' },
      { optionText: 'Fill your entire plate with food at every meal', isCorrect: false, explanation: 'Plate size matters. Using large plates encourages overeating. Half should be vegetables, quarter protein, quarter carbs.' },
      { optionText: 'Eat directly from packages to know exact amounts', isCorrect: false, explanation: 'Eating from packages leads to overeating. Portion out servings to control intake.' },
      { optionText: 'Portion control doesn\'t matter as long as food is healthy', isCorrect: false, explanation: 'Even healthy foods contribute calories. Portion control helps maintain healthy weight with any diet.' }
    ]
  });

  // Question 35: Hydration needs
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'How can you tell if you\'re drinking enough water?',
    patientContext: 'Person asking about hydration assessment',
    patientName: 'Diane',
    patientAge: 38,
    difficultyLevel: 'BEGINNER',
    hintText: 'Your body provides simple signals about hydration status.',
    answerOptions: [
      { optionText: 'Urine should be pale yellow; darker means you need more fluids', isCorrect: true, explanation: 'Urine color is the best hydration indicator. Pale yellow is ideal. Dark yellow or amber indicates dehydration.' },
      { optionText: 'Only drink when you feel thirsty', isCorrect: false, explanation: 'Thirst lags behind dehydration, especially in older adults. Drink regularly throughout the day.' },
      { optionText: 'Everyone needs exactly 8 glasses per day', isCorrect: false, explanation: 'Needs vary by size, activity, climate, and health. Let thirst and urine color guide intake.' },
      { optionText: 'Coffee and tea don\'t count toward hydration', isCorrect: false, explanation: 'All beverages contribute to hydration. While caffeine has mild diuretic effect, caffeinated drinks still hydrate.' }
    ]
  });

  // Question 36: Calcium sources
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You don\'t drink milk. What are good non-dairy calcium sources?',
    patientContext: 'Person avoiding dairy seeking calcium alternatives',
    patientName: 'Ruth',
    patientAge: 54,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Many plant foods and fortified products provide calcium.',
    answerOptions: [
      { optionText: 'Leafy greens, fortified plant milks, tofu, sardines with bones, and almonds', isCorrect: true, explanation: 'Many non-dairy foods are calcium-rich. Fortified products, leafy greens, and fish with edible bones are excellent sources.' },
      { optionText: 'There are no calcium sources besides dairy products', isCorrect: false, explanation: 'Many plant and animal foods contain calcium. Dairy-free diets can meet calcium needs with variety.' },
      { optionText: 'Adults don\'t need calcium after age 30', isCorrect: false, explanation: 'Calcium remains essential throughout life for bone health, especially for older adults preventing osteoporosis.' },
      { optionText: 'Supplements are the only option without dairy', isCorrect: false, explanation: 'While supplements can help, many whole foods provide calcium along with other beneficial nutrients.' }
    ]
  });

  // Question 37: Whole grains identification
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'How can you identify if bread is truly "whole grain"?',
    patientContext: 'Person shopping for healthier bread options',
    patientName: 'Raymond',
    patientAge: 49,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Look at the ingredient list, not just the package claims.',
    answerOptions: [
      { optionText: 'The first ingredient should say "whole" (whole wheat, whole oats, etc.)', isCorrect: true, explanation: 'Check ingredients, not just package front. First ingredient should be whole grain. "Wheat bread" isn\'t necessarily whole grain.' },
      { optionText: 'Brown color means it\'s whole grain', isCorrect: false, explanation: 'Brown color can come from molasses or caramel coloring. Check ingredients - only whole grains count.' },
      { optionText: '"Multi-grain" guarantees whole grains', isCorrect: false, explanation: 'Multi-grain just means multiple grains, which could all be refined. Look for "whole" before each grain listed.' },
      { optionText: 'All bread is equally healthy', isCorrect: false, explanation: 'Whole grain bread provides fiber, vitamins, and minerals that refined grains lack. There\'s a significant nutritional difference.' }
    ]
  });

  // Question 38: Vitamin D sources
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You live in a northern climate with limited sun. How can you get enough vitamin D?',
    patientContext: 'Person concerned about vitamin D deficiency',
    patientName: 'Virginia',
    patientAge: 61,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Few foods naturally contain vitamin D, so fortified foods and supplements matter.',
    answerOptions: [
      { optionText: 'Fatty fish, fortified milk/cereals, egg yolks, and consider vitamin D supplements especially in winter', isCorrect: true, explanation: 'Limited sun exposure makes dietary sources crucial. Many people in northern climates need supplements to maintain adequate levels.' },
      { optionText: 'Just spend 30 minutes in the sun daily year-round', isCorrect: false, explanation: 'In northern latitudes, winter sun isn\'t strong enough to produce vitamin D. Dietary sources are essential.' },
      { optionText: 'You can\'t get vitamin D from food, only sunlight works', isCorrect: false, explanation: 'While sun is the main source, foods and supplements can provide vitamin D, especially important in low-sun climates.' },
      { optionText: 'Vitamin D deficiency isn\'t a real concern', isCorrect: false, explanation: 'Deficiency is common in northern climates and affects bone health, immunity, and mood. Supplementation often needed.' }
    ]
  });

  // Question 39: Meal timing for diabetes prevention
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You have prediabetes. When is the best time to eat your largest meal?',
    patientContext: 'Person with prediabetes managing blood sugar',
    patientName: 'Larry',
    patientAge: 53,
    difficultyLevel: 'ADVANCED',
    hintText: 'Your body processes nutrients differently at different times of day.',
    answerOptions: [
      { optionText: 'Earlier in the day (breakfast or lunch) when insulin sensitivity is typically higher', isCorrect: true, explanation: 'Insulin sensitivity is highest in morning. Eating larger meals earlier helps with blood sugar control and weight management.' },
      { optionText: 'Right before bed - your body needs fuel overnight', isCorrect: false, explanation: 'Large evening meals worsen blood sugar control and promote weight gain. Insulin sensitivity is lowest at night.' },
      { optionText: 'Meal timing doesn\'t affect blood sugar', isCorrect: false, explanation: 'Circadian rhythms affect metabolism. Same meal eaten at different times has different blood sugar impact.' },
      { optionText: 'Skip breakfast and eat all calories at dinner', isCorrect: false, explanation: 'This pattern worsens blood sugar control. Eating earlier in the day aligns with natural insulin sensitivity patterns.' }
    ]
  });

  // Question 40: Plant-based protein
  await createQuestion({
    category: 'Preventive Care',
    questionText: 'You want to eat more plant-based meals. What\'s a complete protein source?',
    patientContext: 'Person incorporating more plant-based foods',
    patientName: 'Sharon',
    patientAge: 42,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Some plant proteins contain all essential amino acids.',
    answerOptions: [
      { optionText: 'Quinoa, soy products (tofu, tempeh, edamame), and combinations like rice and beans', isCorrect: true, explanation: 'These provide all essential amino acids. Combining different plant proteins throughout the day ensures complete nutrition.' },
      { optionText: 'No plant foods contain complete protein - meat is required', isCorrect: false, explanation: 'Several plant foods are complete proteins. Combining complementary proteins easily meets all amino acid needs.' },
      { optionText: 'Only animal products provide usable protein', isCorrect: false, explanation: 'Plant proteins are perfectly usable. Many athletes thrive on plant-based diets with adequate protein.' },
      { optionText: 'Protein deficiency is common on plant-based diets', isCorrect: false, explanation: 'Protein deficiency is rare in developed countries on any diet. Varied plant-based diets easily meet protein needs.' }
    ]
  });

  console.log('Successfully created 40 medication, preventative care, and nutrition questions!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

