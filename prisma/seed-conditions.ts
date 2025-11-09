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

  console.log('Creating 50 common conditions questions...');
  
  // Question 1: Cold vs Flu differentiation
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'How can you tell the difference between a cold and the flu?',
    patientContext: 'Patient with respiratory symptoms trying to identify illness',
    patientName: 'Emma',
    patientAge: 34,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about the speed of onset and severity of symptoms.',
    answerOptions: [
      { optionText: 'Flu symptoms come on suddenly and are more severe, while colds develop gradually', isCorrect: true, explanation: 'Flu typically causes sudden fever, body aches, and fatigue, while colds develop slowly with milder symptoms.' },
      { optionText: 'They\'re the same thing with different names', isCorrect: false, explanation: 'Colds and flu are caused by different viruses and have distinct symptom patterns.' },
      { optionText: 'Colds always include high fever, flu never does', isCorrect: false, explanation: 'Actually, flu typically causes high fever while colds rarely do.' },
      { optionText: 'Only flu is contagious', isCorrect: false, explanation: 'Both colds and flu are highly contagious respiratory infections.' }
    ]
  });

  // Question 2: Type 2 Diabetes management scenario
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You were just diagnosed with Type 2 diabetes. Your blood sugar this morning was 180 mg/dL after fasting. What should be your FIRST step?',
    patientContext: 'Newly diagnosed diabetic learning management',
    patientName: 'Robert',
    patientAge: 52,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Managing diabetes involves multiple factors, but one foundational step comes first.',
    answerOptions: [
      { optionText: 'Schedule a follow-up with your doctor and start monitoring your blood sugar regularly', isCorrect: true, explanation: 'Establishing monitoring patterns and medical follow-up creates the foundation for effective diabetes management.' },
      { optionText: 'Immediately start an extreme low-carb diet', isCorrect: false, explanation: 'Drastic diet changes without medical guidance can be dangerous. Work with your doctor on sustainable changes.' },
      { optionText: 'Exercise for 2 hours daily starting tomorrow', isCorrect: false, explanation: 'While exercise helps, sudden intense activity can be risky. Start gradually with doctor approval.' },
      { optionText: 'Wait to see if the numbers improve on their own', isCorrect: false, explanation: 'Diabetes requires active management. Delaying treatment can lead to complications.' }
    ]
  });

  // Question 3: High blood pressure lifestyle
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your doctor says you have "prehypertension" with readings of 130/85. Which lifestyle change has the MOST immediate impact?',
    patientContext: 'Patient with elevated blood pressure seeking management',
    patientName: 'Linda',
    patientAge: 48,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'One dietary change can significantly lower blood pressure within weeks.',
    answerOptions: [
      { optionText: 'Reducing sodium intake to less than 2,300mg per day', isCorrect: true, explanation: 'Lowering sodium is one of the fastest ways to reduce blood pressure, often showing results in 2-4 weeks.' },
      { optionText: 'Taking vitamin supplements', isCorrect: false, explanation: 'While some supplements may help, they\'re not as effective as sodium reduction for immediate impact.' },
      { optionText: 'Drinking 8 glasses of water daily', isCorrect: false, explanation: 'Hydration is important but doesn\'t directly lower blood pressure as effectively as sodium reduction.' },
      { optionText: 'Avoiding all exercise until blood pressure normalizes', isCorrect: false, explanation: 'Regular moderate exercise actually helps lower blood pressure. It shouldn\'t be avoided.' }
    ]
  });

  // Question 4: Asthma emergency recognition
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have asthma and used your rescue inhaler 10 minutes ago, but you\'re still having trouble breathing and speaking in full sentences. What should you do?',
    patientContext: 'Asthmatic experiencing severe symptoms despite medication',
    patientName: 'Tyler',
    patientAge: 28,
    difficultyLevel: 'ADVANCED',
    hintText: 'Difficulty speaking and lack of response to rescue inhaler are serious warning signs.',
    answerOptions: [
      { optionText: 'Call 911 or go to the emergency room immediately - this is a medical emergency', isCorrect: true, explanation: 'Inability to speak full sentences and lack of relief from rescue inhaler indicate a severe asthma attack requiring emergency care.' },
      { optionText: 'Wait another 10 minutes and take another puff of the inhaler', isCorrect: false, explanation: 'Waiting could be life-threatening. Severe asthma attacks require immediate medical attention.' },
      { optionText: 'Lie down and rest until the symptoms pass', isCorrect: false, explanation: 'Lying down can worsen breathing difficulty. This situation requires emergency medical care.' },
      { optionText: 'Drink cold water to help calm your breathing', isCorrect: false, explanation: 'A severe asthma attack needs medical intervention, not home remedies.' }
    ]
  });

  // Question 5: Seasonal allergies vs cold
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'ve had a runny nose, sneezing, and itchy eyes for 2 weeks. No fever or body aches. What\'s the most likely cause?',
    patientContext: 'Patient with prolonged respiratory symptoms',
    patientName: 'Jessica',
    patientAge: 31,
    difficultyLevel: 'BEGINNER',
    hintText: 'Consider the duration and type of symptoms, especially the itchy eyes.',
    answerOptions: [
      { optionText: 'Seasonal allergies - colds don\'t usually last this long or cause itchy eyes', isCorrect: true, explanation: 'The 2-week duration and itchy eyes strongly suggest allergies. Colds typically resolve in 7-10 days.' },
      { optionText: 'A severe bacterial infection requiring antibiotics', isCorrect: false, explanation: 'Bacterial infections usually include fever and worsen over time. These symptoms suggest allergies.' },
      { optionText: 'Early stage pneumonia', isCorrect: false, explanation: 'Pneumonia includes fever, chest pain, and productive cough, not itchy eyes and sneezing.' },
      { optionText: 'Nothing serious - just ignore it', isCorrect: false, explanation: 'While not emergent, persistent allergies should be addressed as they affect quality of life and can worsen.' }
    ]
  });

  // Question 6: UTI recognition in women
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'re experiencing burning during urination and frequent urges to go, but only small amounts come out. What might this indicate?',
    patientContext: 'Woman with urinary symptoms',
    patientName: 'Nicole',
    patientAge: 29,
    difficultyLevel: 'BEGINNER',
    hintText: 'These are classic symptoms of a common bacterial infection.',
    answerOptions: [
      { optionText: 'Likely a urinary tract infection (UTI) - see your doctor for testing and antibiotics', isCorrect: true, explanation: 'These are hallmark UTI symptoms. Early treatment prevents the infection from spreading to kidneys.' },
      { optionText: 'Normal variation in urination - no action needed', isCorrect: false, explanation: 'Burning and frequency are not normal and indicate an infection that needs treatment.' },
      { optionText: 'Kidney failure requiring emergency care', isCorrect: false, explanation: 'Kidney failure has different symptoms. This is likely a simple UTI, though untreated UTIs can affect kidneys.' },
      { optionText: 'Drink cranberry juice and it will resolve on its own', isCorrect: false, explanation: 'While cranberry may help prevent UTIs, active infections require antibiotic treatment.' }
    ]
  });

  // Question 7: Migraine vs regular headache
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your headache is throbbing on one side, you feel nauseous, and light bothers you. Is this different from a regular headache?',
    patientContext: 'Patient experiencing severe headache with additional symptoms',
    patientName: 'Chris',
    patientAge: 36,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'These symptoms together point to a specific type of headache disorder.',
    answerOptions: [
      { optionText: 'Yes, these are classic migraine symptoms - discuss treatment options with your doctor', isCorrect: true, explanation: 'One-sided throbbing pain with nausea and light sensitivity are hallmark migraine symptoms requiring specific treatment.' },
      { optionText: 'No, all headaches are the same', isCorrect: false, explanation: 'Migraines are distinct from tension headaches and require different treatment approaches.' },
      { optionText: 'This always indicates a brain tumor', isCorrect: false, explanation: 'While concerning headaches need evaluation, these symptoms are typical of migraines, not tumors.' },
      { optionText: 'Just take regular pain relievers and ignore other symptoms', isCorrect: false, explanation: 'Migraines often need specific medications. Regular pain relievers may be less effective and trigger rebound headaches.' }
    ]
  });

  // Question 8: Acid reflux/GERD management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You experience heartburn 3-4 times per week, especially after dinner and when lying down. What should you try FIRST?',
    patientContext: 'Patient with frequent acid reflux symptoms',
    patientName: 'Daniel',
    patientAge: 44,
    difficultyLevel: 'BEGINNER',
    hintText: 'Lifestyle modifications are often the first line of treatment for acid reflux.',
    answerOptions: [
      { optionText: 'Eat smaller meals, avoid eating 3 hours before bed, and elevate your head while sleeping', isCorrect: true, explanation: 'These lifestyle changes reduce acid reflux by decreasing stomach pressure and preventing acid from flowing back up.' },
      { optionText: 'Take maximum-strength antacids before every meal', isCorrect: false, explanation: 'While helpful occasionally, daily antacid use without trying lifestyle changes first isn\'t recommended.' },
      { optionText: 'Stop eating all food after 2 PM', isCorrect: false, explanation: 'This is too extreme. Simply avoiding food 3 hours before bed is usually sufficient.' },
      { optionText: 'Ignore it - heartburn is normal for everyone', isCorrect: false, explanation: 'Frequent heartburn can indicate GERD and should be addressed to prevent complications like esophageal damage.' }
    ]
  });

  // Question 9: Strep throat identification
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your throat is very sore, you have white patches on your tonsils, fever, and swollen lymph nodes. No cough or runny nose. What\'s the likely diagnosis?',
    patientContext: 'Patient with throat infection symptoms',
    patientName: 'Megan',
    patientAge: 22,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The absence of cold symptoms combined with specific throat signs points to a bacterial cause.',
    answerOptions: [
      { optionText: 'Likely strep throat - see a doctor for a rapid test and possible antibiotics', isCorrect: true, explanation: 'White patches, fever, and swollen nodes without cold symptoms strongly suggest strep, which requires antibiotics.' },
      { optionText: 'Just a viral cold that will go away in a few days', isCorrect: false, explanation: 'Viral colds typically include runny nose and cough. These symptoms suggest bacterial strep throat.' },
      { optionText: 'Throat cancer requiring immediate surgery', isCorrect: false, explanation: 'These are acute infection symptoms, not cancer. Strep throat is common and treatable.' },
      { optionText: 'Take leftover antibiotics from last year', isCorrect: false, explanation: 'Never use old antibiotics. You need proper diagnosis and current prescription if strep is confirmed.' }
    ]
  });

  // Question 10: Eczema management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your child has dry, itchy patches of skin that worsen in winter. The pediatrician diagnosed eczema. What\'s the MOST important daily management step?',
    patientContext: 'Parent managing child\'s eczema',
    patientName: 'Sarah',
    patientAge: 35,
    difficultyLevel: 'BEGINNER',
    hintText: 'Eczema management focuses heavily on maintaining skin moisture.',
    answerOptions: [
      { optionText: 'Apply thick moisturizer immediately after bathing while skin is still damp', isCorrect: true, explanation: 'Moisturizing damp skin traps water and is the cornerstone of eczema management, reducing flares and itching.' },
      { optionText: 'Bathe multiple times daily to clean the skin', isCorrect: false, explanation: 'Frequent bathing can dry skin further. One bath daily followed by moisturizing is better.' },
      { optionText: 'Use hot water to soothe itching', isCorrect: false, explanation: 'Hot water strips skin oils and worsens eczema. Use lukewarm water instead.' },
      { optionText: 'Avoid all moisturizers until the rash clears', isCorrect: false, explanation: 'This would worsen eczema. Consistent moisturizing prevents and treats flares.' }
    ]
  });

  // Question 11: Depression screening situation
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'For the past month, you\'ve felt sad most days, lost interest in hobbies, have trouble sleeping, and feel worthless. What should you do?',
    patientContext: 'Person experiencing persistent mood symptoms',
    patientName: 'Michael',
    patientAge: 41,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'These symptoms lasting more than two weeks may indicate a treatable medical condition.',
    answerOptions: [
      { optionText: 'Talk to your doctor - these are symptoms of depression, which is a treatable medical condition', isCorrect: true, explanation: 'These symptoms suggest clinical depression. Treatment including therapy and/or medication can be very effective.' },
      { optionText: 'Just try to think more positively and it will pass', isCorrect: false, explanation: 'Depression is a medical condition requiring treatment, not just a mood that can be willed away.' },
      { optionText: 'Assume this is normal stress and ignore it', isCorrect: false, explanation: 'While stress is common, these persistent symptoms indicate depression that should be treated.' },
      { optionText: 'Wait 6 more months to see if it improves naturally', isCorrect: false, explanation: 'Waiting delays needed treatment and can allow depression to worsen. Seek help now.' }
    ]
  });

  // Question 12: Sprain vs fracture
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You twisted your ankle badly. It\'s swollen and painful, but you can still put some weight on it and wiggle your toes. Should you get an X-ray?',
    patientContext: 'Person with ankle injury trying to determine severity',
    patientName: 'Brandon',
    patientAge: 27,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The ability to bear weight and move the joint are important clues about fracture risk.',
    answerOptions: [
      { optionText: 'Use the Ottawa Ankle Rules: X-ray if you can\'t bear weight or have bone tenderness at specific points', isCorrect: true, explanation: 'Being able to bear some weight and move toes suggests a sprain, but check for bone tenderness. When in doubt, get evaluated.' },
      { optionText: 'Never get X-rays for ankle injuries - they\'re always just sprains', isCorrect: false, explanation: 'Ankle fractures are common. X-rays are important when there\'s concern for a break.' },
      { optionText: 'Always get X-rays for any ankle injury no matter how minor', isCorrect: false, explanation: 'Most ankle twists are sprains. X-rays are needed based on severity and specific clinical signs.' },
      { optionText: 'If you can wiggle your toes, it\'s definitely not broken', isCorrect: false, explanation: 'Toe movement doesn\'t rule out ankle fractures. Weight-bearing ability is more informative.' }
    ]
  });

  // Question 13: Pink eye (conjunctivitis)
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your eye is red, itchy, with yellow-green discharge that crusts overnight. What type of conjunctivitis do you likely have?',
    patientContext: 'Patient with eye infection symptoms',
    patientName: 'Amanda',
    patientAge: 33,
    difficultyLevel: 'BEGINNER',
    hintText: 'The color and type of discharge helps identify if it\'s viral, bacterial, or allergic.',
    answerOptions: [
      { optionText: 'Bacterial conjunctivitis - see a doctor for antibiotic eye drops', isCorrect: true, explanation: 'Yellow-green discharge that crusts, especially overnight, indicates bacterial infection requiring antibiotic drops.' },
      { optionText: 'Allergic conjunctivitis - take allergy medication', isCorrect: false, explanation: 'Allergic conjunctivitis causes clear, watery discharge, not yellow-green pus.' },
      { optionText: 'Viral conjunctivitis - antibiotics will cure it quickly', isCorrect: false, explanation: 'Viral pink eye has watery discharge, and antibiotics don\'t work on viruses.' },
      { optionText: 'This is normal eye redness requiring no treatment', isCorrect: false, explanation: 'Purulent discharge indicates infection requiring treatment.' }
    ]
  });

  // Question 14: Shingles recognition
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have a painful rash with blisters that appears in a stripe on one side of your torso. You had chickenpox as a child. What might this be?',
    patientContext: 'Adult with painful unilateral rash',
    patientName: 'Richard',
    patientAge: 58,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The pattern and location of the rash, plus chickenpox history, are key clues.',
    answerOptions: [
      { optionText: 'Likely shingles - see a doctor within 72 hours for antiviral medication', isCorrect: true, explanation: 'One-sided stripe rash with blisters in someone who had chickenpox is classic shingles. Early antiviral treatment reduces severity.' },
      { optionText: 'Just a heat rash that will go away on its own', isCorrect: false, explanation: 'Heat rash doesn\'t cause the pain or follow nerve patterns like shingles does.' },
      { optionText: 'Chickenpox again - once you have it once, you\'re immune', isCorrect: false, explanation: 'This is shingles, caused by reactivation of the chickenpox virus. It\'s not a new case of chickenpox.' },
      { optionText: 'Apply hydrocortisone cream and forget about it', isCorrect: false, explanation: 'Shingles requires antiviral medication for best outcomes. Topical cream alone is insufficient.' }
    ]
  });

  // Question 15: Insomnia approach
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'ve had trouble falling asleep and staying asleep for the past month. What should you try BEFORE asking for sleeping pills?',
    patientContext: 'Person with chronic sleep difficulties',
    patientName: 'Jennifer',
    patientAge: 39,
    difficultyLevel: 'BEGINNER',
    hintText: 'Sleep hygiene practices are the first-line treatment for insomnia.',
    answerOptions: [
      { optionText: 'Establish a consistent sleep schedule, avoid screens before bed, and create a dark, cool bedroom', isCorrect: true, explanation: 'Sleep hygiene practices often resolve insomnia without medication and have no side effects.' },
      { optionText: 'Take over-the-counter sleeping pills every night', isCorrect: false, explanation: 'Regular use of sleep aids without addressing underlying issues can lead to dependence.' },
      { optionText: 'Sleep in a different place every night to keep things interesting', isCorrect: false, explanation: 'Consistency in sleep environment actually promotes better sleep.' },
      { optionText: 'Exercise vigorously right before bedtime to tire yourself out', isCorrect: false, explanation: 'Vigorous exercise before bed can be stimulating. Exercise earlier in the day instead.' }
    ]
  });

  // Question 16: Dehydration assessment
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'ve had diarrhea for 2 days. Your urine is dark yellow, you feel dizzy when standing, and your mouth is very dry. What\'s happening?',
    patientContext: 'Person with gastrointestinal illness and new symptoms',
    patientName: 'Kevin',
    patientAge: 31,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'These symptoms together indicate a serious complication of fluid loss.',
    answerOptions: [
      { optionText: 'You\'re dehydrated - increase fluid intake with water and electrolyte solution, call doctor if symptoms worsen', isCorrect: true, explanation: 'Dark urine, dizziness, and dry mouth are dehydration warning signs requiring immediate fluid replacement.' },
      { optionText: 'This is completely normal with diarrhea - no action needed', isCorrect: false, explanation: 'These are signs of significant dehydration, which can become dangerous if not addressed.' },
      { optionText: 'Avoid all liquids until the diarrhea stops', isCorrect: false, explanation: 'This would worsen dehydration. Fluid replacement is crucial during diarrheal illness.' },
      { optionText: 'Drink only coffee and soda for energy', isCorrect: false, explanation: 'Caffeinated beverages can worsen dehydration. Water and electrolyte solutions are needed.' }
    ]
  });

  // Question 17: Anemia symptoms
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'ve been feeling unusually tired, short of breath with mild activity, and have been craving ice. What might explain these symptoms?',
    patientContext: 'Person with fatigue and unusual cravings',
    patientName: 'Rachel',
    patientAge: 26,
    difficultyLevel: 'ADVANCED',
    hintText: 'Ice craving (pica) combined with fatigue suggests a specific blood condition.',
    answerOptions: [
      { optionText: 'Iron-deficiency anemia - see your doctor for blood work', isCorrect: true, explanation: 'Fatigue, shortness of breath, and ice cravings are classic signs of iron-deficiency anemia, confirmed by blood tests.' },
      { optionText: 'Normal stress and busy lifestyle', isCorrect: false, explanation: 'While stress causes fatigue, ice cravings and dyspnea suggest a medical condition like anemia.' },
      { optionText: 'Definitely lung disease requiring immediate intervention', isCorrect: false, explanation: 'These symptoms suggest anemia first. Lung disease is less likely given the constellation of symptoms.' },
      { optionText: 'Just increase caffeine intake for more energy', isCorrect: false, explanation: 'Caffeine masks symptoms but doesn\'t address underlying anemia, which needs treatment.' }
    ]
  });

  // Question 18: Poison ivy management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You touched poison ivy yesterday. The rash is starting to appear on your arm with red, itchy lines. What should you do?',
    patientContext: 'Person with allergic contact dermatitis from poison ivy',
    patientName: 'Jason',
    patientAge: 29,
    difficultyLevel: 'BEGINNER',
    hintText: 'Poison ivy is an allergic reaction that benefits from specific treatments.',
    answerOptions: [
      { optionText: 'Wash the area with soap and water, apply calamine lotion or hydrocortisone cream, and take oral antihistamines', isCorrect: true, explanation: 'Washing removes remaining oils, topical treatments reduce itching, and antihistamines help the allergic reaction.' },
      { optionText: 'Scratch it thoroughly to release the toxins', isCorrect: false, explanation: 'Scratching worsens the rash, causes infection risk, and spreads the reaction. Never scratch.' },
      { optionText: 'Pop any blisters to drain the poison', isCorrect: false, explanation: 'Blisters don\'t contain poison - they\'re your body\'s reaction. Popping them increases infection risk.' },
      { optionText: 'Apply hot compresses to "cook out" the poison', isCorrect: false, explanation: 'Heat can worsen inflammation. Cool compresses are better for poison ivy.' }
    ]
  });

  // Question 19: Pneumonia warning signs
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'ve had a cold for a week. Now you have high fever, chest pain when breathing deeply, and are coughing up yellow-green mucus. What\'s concerning?',
    patientContext: 'Person with respiratory infection that\'s worsening',
    patientName: 'Patricia',
    patientAge: 54,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'A cold that worsens after a week with new severe symptoms suggests bacterial infection.',
    answerOptions: [
      { optionText: 'Possible pneumonia - see your doctor today for chest X-ray and possible antibiotics', isCorrect: true, explanation: 'These symptoms indicate possible pneumonia, especially after a viral cold. Prompt treatment is important.' },
      { optionText: 'Just a normal cold getting better - wait it out', isCorrect: false, explanation: 'Worsening symptoms after a week, especially with chest pain and fever, suggest pneumonia, not improvement.' },
      { optionText: 'Take cough suppressant and ignore other symptoms', isCorrect: false, explanation: 'These symptoms need medical evaluation. Suppressing the cough doesn\'t address possible pneumonia.' },
      { optionText: 'It\'s definitely lung cancer', isCorrect: false, explanation: 'These are acute infection symptoms. Pneumonia is much more likely than cancer.' }
    ]
  });

  // Question 20: Gout flare recognition
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You woke up with severe pain in your big toe - it\'s red, swollen, and so tender that even a bedsheet touching it hurts. What might this be?',
    patientContext: 'Person with acute joint pain',
    patientName: 'William',
    patientAge: 49,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Sudden, severe big toe pain is classic for a specific type of arthritis.',
    answerOptions: [
      { optionText: 'Likely a gout attack - see your doctor for diagnosis and medication', isCorrect: true, explanation: 'Classic gout presents as sudden, severe big toe pain with redness and extreme tenderness.' },
      { optionText: 'Just stubbed toe - will heal in a few days', isCorrect: false, explanation: 'This level of pain and redness without trauma is unusual. The big toe location suggests gout.' },
      { optionText: 'Ingrown toenail causing infection', isCorrect: false, explanation: 'Ingrown toenails cause pain at the nail edge, not the entire joint. This pattern indicates gout.' },
      { optionText: 'Take aspirin regularly - it helps with gout', isCorrect: false, explanation: 'Actually, aspirin can worsen gout. Specific gout medications are needed.' }
    ]
  });

  // Question 21: Anxiety vs heart attack
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You suddenly feel chest tightness, rapid heartbeat, shortness of breath, and overwhelming fear. You\'re 28 and healthy. What might this be?',
    patientContext: 'Young person experiencing acute anxiety symptoms',
    patientName: 'Emily',
    patientAge: 28,
    difficultyLevel: 'ADVANCED',
    hintText: 'Age, health status, and the nature of symptoms help differentiate cardiac from panic events.',
    answerOptions: [
      { optionText: 'Possibly a panic attack, but get evaluated to rule out cardiac causes, especially if it\'s your first time', isCorrect: true, explanation: 'These symptoms match a panic attack in a young person, but first episodes warrant evaluation to rule out heart issues.' },
      { optionText: 'Definitely a heart attack - call 911 immediately', isCorrect: false, explanation: 'While chest pain always deserves evaluation, panic attacks are more likely at age 28 without risk factors.' },
      { optionText: 'Just anxiety - ignore it completely', isCorrect: false, explanation: 'First episodes need evaluation. Even if it\'s panic disorder, treatment is available and helpful.' },
      { optionText: 'Take aspirin and wait 24 hours', isCorrect: false, explanation: 'If there\'s any concern about cardiac causes, evaluation should be prompt, not delayed 24 hours.' }
    ]
  });

  // Question 22: Norovirus management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have sudden onset of vomiting and diarrhea. Several family members are sick too. What\'s the most important action?',
    patientContext: 'Person with acute gastroenteritis in household outbreak',
    patientName: 'Thomas',
    patientAge: 36,
    difficultyLevel: 'BEGINNER',
    hintText: 'Viral gastroenteritis is highly contagious and causes specific complications.',
    answerOptions: [
      { optionText: 'Stay hydrated with small, frequent sips of water or electrolyte drinks, and practice strict hygiene', isCorrect: true, explanation: 'Dehydration is the main danger. Frequent hand-washing prevents spread. Most viral gastroenteritis resolves in 1-3 days.' },
      { optionText: 'Take antibiotics immediately', isCorrect: false, explanation: 'This is likely viral (antibiotics don\'t work on viruses) and self-limited.' },
      { optionText: 'Eat a large meal to keep your strength up', isCorrect: false, explanation: 'Large meals worsen nausea and vomiting. Small amounts of bland food when tolerated is better.' },
      { optionText: 'Avoid all fluids until vomiting stops completely', isCorrect: false, explanation: 'This causes dangerous dehydration. Small, frequent sips even during vomiting is crucial.' }
    ]
  });

  // Question 23: Lyme disease after tick bite
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You removed a tick from your leg 5 days ago. Now there\'s a growing red circle around the bite like a bullseye. What should you do?',
    patientContext: 'Person with rash after tick exposure',
    patientName: 'Lauren',
    patientAge: 32,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'A bullseye rash after tick bite is a specific diagnostic sign.',
    answerOptions: [
      { optionText: 'See a doctor immediately - this bullseye rash (erythema migrans) indicates Lyme disease requiring antibiotics', isCorrect: true, explanation: 'The bullseye rash is pathognomonic for Lyme disease. Early antibiotic treatment prevents serious complications.' },
      { optionText: 'It\'s just a normal reaction to any bug bite - ignore it', isCorrect: false, explanation: 'A bullseye rash specifically indicates Lyme disease, not a normal bite reaction.' },
      { optionText: 'Wait until you develop arthritis, then treat it', isCorrect: false, explanation: 'Early treatment is crucial. Waiting allows the infection to spread and cause harder-to-treat complications.' },
      { optionText: 'Apply hydrocortisone cream - that cures Lyme disease', isCorrect: false, explanation: 'Lyme disease is a bacterial infection requiring oral antibiotics, not topical steroids.' }
    ]
  });

  // Question 24: Osteoarthritis vs inflammatory arthritis
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your knees are stiff and painful in the morning for about 15 minutes, then improve with movement. The pain worsens by evening. What type of arthritis is this?',
    patientContext: 'Person with joint pain trying to identify type',
    patientName: 'Barbara',
    patientAge: 61,
    difficultyLevel: 'ADVANCED',
    hintText: 'The timing and pattern of stiffness helps differentiate osteoarthritis from inflammatory types.',
    answerOptions: [
      { optionText: 'Likely osteoarthritis - brief morning stiffness that worsens with use is typical', isCorrect: true, explanation: 'Osteoarthritis causes <30 minutes of morning stiffness and worsens with joint use throughout the day.' },
      { optionText: 'Definitely rheumatoid arthritis requiring strong immunosuppressants', isCorrect: false, explanation: 'RA causes prolonged morning stiffness (>1 hour) that improves with activity. This pattern suggests osteoarthritis.' },
      { optionText: 'Gout - only gout causes knee pain', isCorrect: false, explanation: 'Gout causes acute, severe flares with redness, not chronic use-related pain.' },
      { optionText: 'Growing pains that will resolve on their own', isCorrect: false, explanation: 'Growing pains occur in children. This pattern in a 61-year-old indicates osteoarthritis.' }
    ]
  });

  // Question 25: Vertigo vs dizziness
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'When you turn your head quickly, the room spins and you feel nauseous. Standing up doesn\'t cause this. What\'s the likely cause?',
    patientContext: 'Person experiencing positional spinning sensation',
    patientName: 'Steven',
    patientAge: 55,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'True vertigo (spinning) triggered by head movement suggests an inner ear problem.',
    answerOptions: [
      { optionText: 'Benign positional vertigo (BPPV) - see a doctor for diagnosis and specific head exercises', isCorrect: true, explanation: 'Head movement-triggered spinning with nausea is classic BPPV, treated with repositioning maneuvers.' },
      { optionText: 'Low blood pressure causing fainting', isCorrect: false, explanation: 'Low blood pressure causes lightheadedness when standing, not spinning with head turns.' },
      { optionText: 'Definitely a stroke - go to ER immediately', isCorrect: false, explanation: 'While stroke can cause vertigo, BPPV is much more common. Stroke vertigo usually includes other symptoms.' },
      { optionText: 'Just normal aging - everyone gets dizzy', isCorrect: false, explanation: 'This specific pattern indicates BPPV, which is treatable. It\'s not normal aging.' }
    ]
  });

  // Question 26: Celiac disease screening
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have chronic diarrhea, bloating, and fatigue. Symptoms worsen after eating bread and pasta. What condition should be tested for?',
    patientContext: 'Person with GI symptoms related to diet',
    patientName: 'Michelle',
    patientAge: 34,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Symptoms triggered specifically by gluten-containing foods point to an autoimmune condition.',
    answerOptions: [
      { optionText: 'Celiac disease - ask for blood tests, and don\'t start a gluten-free diet before testing', isCorrect: true, explanation: 'These symptoms triggered by gluten suggest celiac disease. Testing must be done while still eating gluten for accuracy.' },
      { optionText: 'Food poisoning from contaminated bread', isCorrect: false, explanation: 'Food poisoning is acute, not chronic with a pattern related to specific foods.' },
      { optionText: 'Lactose intolerance causing these symptoms', isCorrect: false, explanation: 'Lactose intolerance relates to dairy, not bread and pasta. Symptoms suggest gluten sensitivity.' },
      { optionText: 'Just start avoiding gluten and skip testing', isCorrect: false, explanation: 'Testing should occur before dietary changes. Going gluten-free first makes celiac testing unreliable.' }
    ]
  });

  // Question 27: Heat exhaustion recognition
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'After working outside on a hot day, you feel dizzy, nauseous, are sweating heavily, and have a headache. Your skin feels cool and clammy. What\'s happening?',
    patientContext: 'Person with heat-related illness',
    patientName: 'Carlos',
    patientAge: 38,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Cool, clammy skin with heavy sweating indicates a specific stage of heat illness.',
    answerOptions: [
      { optionText: 'Heat exhaustion - move to cool area, drink water, and seek medical care if symptoms don\'t improve', isCorrect: true, explanation: 'Cool, sweaty skin with dizziness and nausea indicates heat exhaustion. It can progress to life-threatening heat stroke.' },
      { optionText: 'Heat stroke - this is immediately life-threatening', isCorrect: false, explanation: 'Heat stroke involves hot, DRY skin without sweating. This is heat exhaustion, which precedes heat stroke.' },
      { optionText: 'Normal response to exercise - keep working', isCorrect: false, explanation: 'These are warning signs of heat illness requiring immediate cooling and rest.' },
      { optionText: 'Just drink coffee for energy and continue', isCorrect: false, explanation: 'Caffeine can worsen dehydration. Water and rest in cool environment are needed.' }
    ]
  });

  // Question 28: Hemorrhoids management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have pain and bleeding with bowel movements. You can feel a tender lump near your anus. What\'s the most likely cause?',
    patientContext: 'Person with rectal symptoms',
    patientName: 'Andrew',
    patientAge: 45,
    difficultyLevel: 'BEGINNER',
    hintText: 'Pain, bleeding, and a palpable lump are characteristic of a common anorectal condition.',
    answerOptions: [
      { optionText: 'Hemorrhoids - increase fiber, stay hydrated, use sitz baths, and see doctor if severe', isCorrect: true, explanation: 'These are classic hemorrhoid symptoms. Lifestyle changes help, but medical evaluation is wise for bleeding.' },
      { optionText: 'Definitely colon cancer requiring immediate surgery', isCorrect: false, explanation: 'While rectal bleeding needs evaluation, hemorrhoids are much more common. Doctor can assess for other causes.' },
      { optionText: 'Just ignore it - it will go away instantly', isCorrect: false, explanation: 'While some hemorrhoids resolve, these symptoms warrant evaluation and treatment.' },
      { optionText: 'Use numbing cream and don\'t tell anyone', isCorrect: false, explanation: 'While topical treatments help, medical evaluation is important to rule out other causes of bleeding.' }
    ]
  });

  // Question 29: Carpal tunnel syndrome
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your thumb, index, and middle fingers feel numb and tingly, especially at night. Shaking your hand provides temporary relief. What might this be?',
    patientContext: 'Person with hand numbness and tingling',
    patientName: 'Diana',
    patientAge: 42,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The specific fingers affected and timing point to compression of a particular nerve.',
    answerOptions: [
      { optionText: 'Carpal tunnel syndrome - nerve compression in the wrist; see doctor about wrist splints and treatment options', isCorrect: true, explanation: 'These specific fingers, worse at night, with relief from shaking are classic carpal tunnel syndrome.' },
      { optionText: 'Poor circulation requiring blood thinners', isCorrect: false, explanation: 'This is nerve compression, not circulation. The pattern and relief with shaking indicate carpal tunnel.' },
      { optionText: 'Heart attack warning signs', isCorrect: false, explanation: 'Heart attacks don\'t cause finger-specific numbness worse at night. This is carpal tunnel syndrome.' },
      { optionText: 'Just keep your hand still and it will resolve', isCorrect: false, explanation: 'Carpal tunnel often worsens without treatment. Splinting and sometimes surgery are needed.' }
    ]
  });

  // Question 30: Mononucleosis identification
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'re a college student with severe fatigue, sore throat, swollen lymph nodes in your neck, and mild fever for 2 weeks. What should be tested?',
    patientContext: 'Young person with prolonged viral symptoms',
    patientName: 'Jessica',
    patientAge: 19,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Prolonged fatigue with these symptoms in a young person suggests a specific viral infection.',
    answerOptions: [
      { optionText: 'Mononucleosis (mono) - ask for a monospot test and avoid contact sports due to spleen enlargement', isCorrect: true, explanation: 'Classic mono symptoms in a young person. Diagnosis is important because enlarged spleen can rupture with trauma.' },
      { optionText: 'Just another cold - return to full activities immediately', isCorrect: false, explanation: 'The prolonged course and severity suggest mono. Returning to contact sports risks splenic rupture.' },
      { optionText: 'Definitely HIV requiring immediate treatment', isCorrect: false, explanation: 'While HIV testing may be appropriate, mono is much more likely given the clinical picture.' },
      { optionText: 'Take antibiotics to cure it faster', isCorrect: false, explanation: 'Mono is viral; antibiotics don\'t work. Some antibiotics (like amoxicillin) can even cause rash with mono.' }
    ]
  });

  // Question 31: Restless leg syndrome
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'At bedtime, you have an overwhelming urge to move your legs with uncomfortable sensations. Moving temporarily relieves it. What condition is this?',
    patientContext: 'Person with nighttime leg discomfort',
    patientName: 'Gregory',
    patientAge: 52,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The urge to move, timing at rest, and temporary relief with movement are diagnostic.',
    answerOptions: [
      { optionText: 'Restless legs syndrome - discuss with doctor; iron levels and medications can help', isCorrect: true, explanation: 'The urge to move with relief from movement, worse at rest, is classic RLS. Iron deficiency often contributes.' },
      { optionText: 'Leg cramps requiring calcium supplements', isCorrect: false, explanation: 'Cramps are painful muscle contractions. RLS is an urge to move with uncomfortable sensations.' },
      { optionText: 'Deep vein thrombosis requiring emergency care', isCorrect: false, explanation: 'DVT causes unilateral swelling, pain, and redness, not bilateral urge to move.' },
      { optionText: 'Just anxiety - take sleeping pills', isCorrect: false, explanation: 'RLS is a neurological condition, not anxiety. Specific treatments target the underlying cause.' }
    ]
  });

  // Question 32: Diverticulitis awareness
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have lower left abdominal pain, fever, and changes in bowel habits. You\'re over 50. What condition should be considered?',
    patientContext: 'Older adult with abdominal pain and systemic symptoms',
    patientName: 'Dorothy',
    patientAge: 67,
    difficultyLevel: 'ADVANCED',
    hintText: 'Left lower quadrant pain with fever in older adults has a specific common cause.',
    answerOptions: [
      { optionText: 'Diverticulitis - see a doctor for evaluation, possible CT scan, and treatment', isCorrect: true, explanation: 'Left lower abdominal pain with fever in older adults is classic diverticulitis requiring antibiotics.' },
      { optionText: 'Appendicitis requiring immediate surgery', isCorrect: false, explanation: 'Appendicitis causes RIGHT lower pain. Left-sided pain in this age group suggests diverticulitis.' },
      { optionText: 'Just constipation - take laxatives', isCorrect: false, explanation: 'Fever indicates infection. Diverticulitis needs antibiotics, and laxatives could worsen it.' },
      { optionText: 'Normal gas and bloating from aging', isCorrect: false, explanation: 'Fever with localized pain isn\'t normal at any age and indicates possible infection.' }
    ]
  });

  // Question 33: Scabies identification
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have intense itching, worse at night, with small bumps and burrow marks between your fingers and on wrists. Others in your household itch too. What is this?',
    patientContext: 'Person with contagious parasitic skin condition',
    patientName: 'Timothy',
    patientAge: 25,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Intense nighttime itching between fingers with burrows and household contacts is diagnostic.',
    answerOptions: [
      { optionText: 'Scabies - see a doctor for prescription cream; all household members need treatment simultaneously', isCorrect: true, explanation: 'These are classic scabies symptoms. Simultaneous treatment of all contacts is essential to prevent reinfection.' },
      { optionText: 'Just dry skin requiring only moisturizer', isCorrect: false, explanation: 'Dry skin doesn\'t cause burrows or affect multiple household members simultaneously.' },
      { optionText: 'Bed bugs that live in your skin', isCorrect: false, explanation: 'Bed bugs bite but don\'t burrow. Scabies mites burrow under skin, causing the characteristic patterns.' },
      { optionText: 'Use only calamine lotion - no doctor needed', isCorrect: false, explanation: 'Scabies requires prescription medication to kill the mites. Calamine only masks symptoms.' }
    ]
  });

  // Question 34: Plantar fasciitis
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have sharp heel pain when taking your first steps in the morning. The pain improves after walking around. What\'s the likely diagnosis?',
    patientContext: 'Person with morning heel pain',
    patientName: 'Susan',
    patientAge: 48,
    difficultyLevel: 'BEGINNER',
    hintText: 'Morning heel pain that improves with activity indicates inflammation of a specific foot structure.',
    answerOptions: [
      { optionText: 'Plantar fasciitis - treat with stretching, ice, supportive shoes, and rest', isCorrect: true, explanation: 'Sharp morning heel pain that improves with movement is classic plantar fasciitis.' },
      { optionText: 'Broken heel bone requiring immediate casting', isCorrect: false, explanation: 'A fracture would cause constant pain that worsens with walking, not improvement.' },
      { optionText: 'Gout in the heel requiring medication', isCorrect: false, explanation: 'Gout causes constant severe pain with redness and swelling, not pain that improves with activity.' },
      { optionText: 'Just wear tighter shoes to provide more support', isCorrect: false, explanation: 'Tight shoes worsen plantar fasciitis. Supportive, properly fitted shoes with arch support are needed.' }
    ]
  });

  // Question 35: Rosacea recognition
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have persistent facial redness, especially on your cheeks and nose, with occasional bumps. Hot drinks and spicy food make it worse. What might this be?',
    patientContext: 'Adult with chronic facial redness',
    patientName: 'Margaret',
    patientAge: 44,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Facial redness with triggers like hot drinks suggests a specific inflammatory skin condition.',
    answerOptions: [
      { optionText: 'Rosacea - see a dermatologist for diagnosis and treatment; avoid known triggers', isCorrect: true, explanation: 'Central facial redness with triggers like heat and spicy food is characteristic of rosacea.' },
      { optionText: 'Allergic reaction requiring antihistamines', isCorrect: false, explanation: 'Allergic reactions are acute, not chronic with specific triggers. This pattern indicates rosacea.' },
      { optionText: 'Just normal skin coloring - no treatment needed', isCorrect: false, explanation: 'Progressive facial redness with bumps is rosacea, which can worsen without treatment.' },
      { optionText: 'Acne that can be cured with harsh scrubbing', isCorrect: false, explanation: 'This is rosacea, not acne. Harsh scrubbing worsens rosacea. Gentle care is needed.' }
    ]
  });

  // Question 36: Kidney stone passage
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have sudden, severe pain in your back/side that comes in waves, blood in urine, and nausea. What\'s the most likely cause?',
    patientContext: 'Person with acute flank pain',
    patientName: 'Charles',
    patientAge: 41,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Colicky flank pain with hematuria is a classic presentation.',
    answerOptions: [
      { optionText: 'Kidney stone - seek medical care for pain management and imaging to assess stone size/location', isCorrect: true, explanation: 'Wave-like flank pain with blood in urine is classic for kidney stones. Medical evaluation determines if intervention is needed.' },
      { optionText: 'Just a pulled muscle from exercise', isCorrect: false, explanation: 'Muscle pain doesn\'t cause blood in urine or the wave-like pattern typical of kidney stones.' },
      { optionText: 'Drink lots of cranberry juice and it will dissolve', isCorrect: false, explanation: 'Kidney stones don\'t dissolve with cranberry juice. Medical evaluation and treatment are needed.' },
      { optionText: 'Appendicitis requiring emergency surgery', isCorrect: false, explanation: 'Appendicitis causes right lower abdominal pain, not flank pain with hematuria.' }
    ]
  });

  // Question 37: Hypothyroidism symptoms
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'ve been feeling exhausted, gaining weight despite normal eating, feeling cold all the time, and your skin is very dry. What might explain this?',
    patientContext: 'Person with multiple systemic symptoms',
    patientName: 'Karen',
    patientAge: 46,
    difficultyLevel: 'ADVANCED',
    hintText: 'These symptoms together suggest decreased metabolism from an endocrine problem.',
    answerOptions: [
      { optionText: 'Hypothyroidism - ask for thyroid function tests (TSH, T4)', isCorrect: true, explanation: 'Fatigue, weight gain, cold intolerance, and dry skin together strongly suggest underactive thyroid.' },
      { optionText: 'Just getting older - this is completely normal', isCorrect: false, explanation: 'While aging brings changes, this constellation of symptoms suggests hypothyroidism, which is treatable.' },
      { optionText: 'Hyperthyroidism causing all these symptoms', isCorrect: false, explanation: 'Hyperthyroidism causes opposite symptoms: weight loss, heat intolerance, and anxiety.' },
      { optionText: 'Simply not getting enough sleep', isCorrect: false, explanation: 'Sleep deprivation doesn\'t cause weight gain, cold intolerance, and dry skin together like hypothyroidism does.' }
    ]
  });

  // Question 38: Sinusitis vs common cold
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your "cold" has lasted 12 days with thick yellow nasal discharge, facial pressure/pain, and worsening symptoms. When should you see a doctor?',
    patientContext: 'Person with prolonged upper respiratory symptoms',
    patientName: 'Joseph',
    patientAge: 38,
    difficultyLevel: 'BEGINNER',
    hintText: 'Duration and worsening symptoms suggest bacterial infection.',
    answerOptions: [
      { optionText: 'See a doctor now - symptoms lasting >10 days or worsening suggest bacterial sinusitis needing antibiotics', isCorrect: true, explanation: 'Colds improve by day 10. Persistent or worsening symptoms with facial pain suggest bacterial sinusitis.' },
      { optionText: 'Wait another month to see if it resolves', isCorrect: false, explanation: 'Delaying treatment allows infection to worsen and potentially spread. See a doctor now.' },
      { optionText: 'It\'s just a normal cold - all colds last this long', isCorrect: false, explanation: 'Viral colds typically resolve in 7-10 days. This duration with worsening suggests bacterial infection.' },
      { optionText: 'Take leftover antibiotics from a previous illness', isCorrect: false, explanation: 'Never use old antibiotics. You need proper evaluation and a current prescription if indicated.' }
    ]
  });

  // Question 39: Tendonitis management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your elbow hurts on the outside when gripping or lifting objects. You play tennis regularly. What\'s the likely diagnosis and first treatment?',
    patientContext: 'Athlete with overuse injury',
    patientName: 'Mark',
    patientAge: 42,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Repetitive activity causing lateral elbow pain has a specific name.',
    answerOptions: [
      { optionText: 'Tennis elbow (lateral epicondylitis) - rest, ice, NSAIDs, and consider physical therapy', isCorrect: true, explanation: 'Lateral elbow pain with gripping in tennis players is classic tennis elbow, treated with rest and therapy.' },
      { optionText: 'Broken elbow requiring immediate surgery', isCorrect: false, explanation: 'A fracture would have occurred with trauma and cause constant severe pain, not activity-related pain.' },
      { optionText: 'Keep playing through the pain to strengthen it', isCorrect: false, explanation: 'Playing through tendonitis worsens the injury. Rest and proper treatment are essential.' },
      { optionText: 'Nerve damage requiring emergency evaluation', isCorrect: false, explanation: 'Nerve damage causes numbness/tingling. This activity-related pain pattern indicates tendonitis.' }
    ]
  });

  // Question 40: Lactose intolerance
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Within 30 minutes of drinking milk or eating ice cream, you get bloating, gas, and diarrhea. Other foods don\'t cause this. What\'s likely?',
    patientContext: 'Person with food-related digestive symptoms',
    patientName: 'Maria',
    patientAge: 33,
    difficultyLevel: 'BEGINNER',
    hintText: 'Symptoms specifically after dairy products suggest an enzyme deficiency.',
    answerOptions: [
      { optionText: 'Lactose intolerance - try lactose-free dairy products or take lactase enzyme supplements', isCorrect: true, explanation: 'Symptoms within 30-120 minutes of dairy specifically indicate lactose intolerance.' },
      { optionText: 'Food poisoning requiring antibiotics', isCorrect: false, explanation: 'Food poisoning doesn\'t cause consistent symptoms with specific foods. This pattern indicates lactose intolerance.' },
      { optionText: 'Gluten sensitivity from the milk', isCorrect: false, explanation: 'Milk doesn\'t contain gluten. These symptoms after dairy indicate lactose intolerance.' },
      { optionText: 'Dairy allergy - immediately use an EpiPen', isCorrect: false, explanation: 'Dairy allergy causes rapid severe reactions. Lactose intolerance causes gradual digestive symptoms.' }
    ]
  });

  // Question 41: Ringworm identification
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have a round, red, scaly rash with a clear center on your arm. The outer edge is raised and itchy. What is this?',
    patientContext: 'Person with characteristic circular rash',
    patientName: 'Anthony',
    patientAge: 28,
    difficultyLevel: 'BEGINNER',
    hintText: 'The ring-shaped pattern with clear center is diagnostic for a fungal infection.',
    answerOptions: [
      { optionText: 'Ringworm (tinea) - use over-the-counter antifungal cream; see doctor if it doesn\'t improve', isCorrect: true, explanation: 'Ring-shaped rash with raised, scaly border and clear center is classic ringworm, a fungal infection.' },
      { optionText: 'Worm living under your skin that needs to be surgically removed', isCorrect: false, explanation: 'Despite the name, ringworm is a fungus, not an actual worm. It\'s treated with antifungal cream.' },
      { optionText: 'Lyme disease requiring immediate IV antibiotics', isCorrect: false, explanation: 'Lyme\'s bullseye rash appears after tick bite and isn\'t scaly. This pattern indicates ringworm.' },
      { optionText: 'Just dry skin - use regular lotion', isCorrect: false, explanation: 'The ring pattern with raised border indicates fungal infection, not dryness. Antifungal treatment is needed.' }
    ]
  });

  // Question 42: Sleep apnea screening
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your partner says you snore loudly, sometimes stop breathing during sleep, and gasp. You\'re tired all day despite 8 hours in bed. What should be evaluated?',
    patientContext: 'Person with witnessed sleep disturbance',
    patientName: 'David',
    patientAge: 51,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Witnessed breathing pauses during sleep with daytime fatigue suggest a specific condition.',
    answerOptions: [
      { optionText: 'Sleep apnea - ask your doctor about a sleep study; untreated, it increases heart disease risk', isCorrect: true, explanation: 'Snoring with breathing pauses and daytime fatigue despite adequate sleep time is classic for sleep apnea.' },
      { optionText: 'Just normal snoring - everyone snores sometimes', isCorrect: false, explanation: 'Breathing pauses (apnea) are not normal and indicate a serious condition affecting health.' },
      { optionText: 'You just need more sleep - aim for 12 hours', isCorrect: false, explanation: 'Sleep apnea prevents restful sleep regardless of time in bed. Quality, not quantity, is the issue.' },
      { optionText: 'Drink alcohol before bed to relax and sleep better', isCorrect: false, explanation: 'Alcohol worsens sleep apnea by relaxing throat muscles further. It should be avoided.' }
    ]
  });

  // Question 43: Anxiety disorder recognition
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You worry excessively about many things daily, have trouble concentrating, feel tense, and it\'s affecting your work for 8 months. What might this be?',
    patientContext: 'Person with chronic worry and tension',
    patientName: 'Elizabeth',
    patientAge: 37,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Excessive worry most days for over 6 months meets criteria for a specific disorder.',
    answerOptions: [
      { optionText: 'Generalized anxiety disorder - talk to your doctor about therapy and possibly medication', isCorrect: true, explanation: 'Excessive worry most days for >6 months with physical symptoms indicates GAD, which is very treatable.' },
      { optionText: 'Normal stress that everyone experiences', isCorrect: false, explanation: 'While stress is common, symptoms this severe and prolonged indicate an anxiety disorder needing treatment.' },
      { optionText: 'Definitely a brain tumor', isCorrect: false, explanation: 'These are classic anxiety symptoms. Brain tumors cause different neurological symptoms.' },
      { optionText: 'Just try to worry less - it\'s all in your head', isCorrect: false, explanation: 'GAD is a medical condition with biological basis. "Try not to worry" isn\'t effective treatment.' }
    ]
  });

  // Question 44: Bronchitis vs pneumonia
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have a persistent cough with mucus for 2 weeks. No fever, chest pain, or shortness of breath. What\'s the most likely diagnosis?',
    patientContext: 'Person with isolated cough symptoms',
    patientName: 'Christopher',
    patientAge: 39,
    difficultyLevel: 'BEGINNER',
    hintText: 'Cough without fever or chest symptoms suggests inflammation of airways rather than lung infection.',
    answerOptions: [
      { optionText: 'Acute bronchitis - usually viral and self-limited; treat symptoms with rest and fluids', isCorrect: true, explanation: 'Productive cough without fever or breathing difficulty is typical bronchitis, usually not requiring antibiotics.' },
      { optionText: 'Definitely pneumonia requiring immediate hospitalization', isCorrect: false, explanation: 'Pneumonia typically includes fever, chest pain, and shortness of breath, which are absent here.' },
      { optionText: 'Lung cancer that needs urgent treatment', isCorrect: false, explanation: 'Acute cough for 2 weeks is much more likely bronchitis. Cancer causes gradual symptom onset.' },
      { optionText: 'Tuberculosis requiring isolation', isCorrect: false, explanation: 'TB causes chronic symptoms with weight loss and night sweats. This acute presentation suggests bronchitis.' }
    ]
  });

  // Question 45: Varicose veins
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have bulging, twisted veins visible on your legs. Your legs ache and feel heavy, especially after standing all day. What is this?',
    patientContext: 'Person with visible leg vein changes',
    patientName: 'Nancy',
    patientAge: 56,
    difficultyLevel: 'BEGINNER',
    hintText: 'Visible twisted veins with aching after standing indicates valve problems.',
    answerOptions: [
      { optionText: 'Varicose veins - elevate legs when resting, wear compression stockings, and discuss with doctor', isCorrect: true, explanation: 'Bulging visible veins with leg aching after standing are varicose veins from valve dysfunction.' },
      { optionText: 'Deep vein thrombosis requiring emergency treatment', isCorrect: false, explanation: 'DVT causes sudden swelling, pain, and redness in one leg, not gradual visible veins in both legs.' },
      { optionText: 'Normal aging veins that need no treatment', isCorrect: false, explanation: 'While common, varicose veins can cause complications and have treatment options worth discussing.' },
      { optionText: 'Apply heat to dilate veins further', isCorrect: false, explanation: 'Heat worsens symptoms. Elevation and compression help by improving venous return.' }
    ]
  });

  // Question 46: Gastroenteritis food vs viral
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your whole family ate at a restaurant. Within 4 hours, everyone has nausea and vomiting. What\'s the likely cause?',
    patientContext: 'Group illness after shared meal',
    patientName: 'Paul',
    patientAge: 44,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Rapid onset in multiple people after shared food suggests a specific type of illness.',
    answerOptions: [
      { optionText: 'Food poisoning (likely staph toxin) - stay hydrated; symptoms usually resolve in 24 hours', isCorrect: true, explanation: 'Multiple people sick within hours of shared meal indicates food poisoning, often from bacterial toxins.' },
      { optionText: 'Viral gastroenteritis spreading in the family', isCorrect: false, explanation: 'Viral illness takes 24-48 hours to incubate. Simultaneous illness in hours suggests food poisoning.' },
      { optionText: 'Everyone coincidentally got the flu at once', isCorrect: false, explanation: 'Flu doesn\'t cause primarily vomiting, and simultaneous onset after shared meal indicates food source.' },
      { optionText: 'Mass hysteria with no real illness', isCorrect: false, explanation: 'Actual vomiting in multiple people after eating together is food poisoning, not psychological.' }
    ]
  });

  // Question 47: Gallstones/cholecystitis
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'After eating a fatty meal, you have severe right upper abdominal pain radiating to your right shoulder, with nausea. What might this indicate?',
    patientContext: 'Person with postprandial abdominal pain',
    patientName: 'Betty',
    patientAge: 49,
    difficultyLevel: 'ADVANCED',
    hintText: 'Right upper quadrant pain after fatty food with referred shoulder pain suggests biliary disease.',
    answerOptions: [
      { optionText: 'Possible gallbladder attack (cholecystitis) - see a doctor for ultrasound and evaluation', isCorrect: true, explanation: 'Right upper quadrant pain after fatty meals with right shoulder radiation is classic for gallbladder disease.' },
      { optionText: 'Appendicitis requiring immediate surgery', isCorrect: false, explanation: 'Appendicitis causes right LOWER pain. Right upper pain after fatty food suggests gallbladder.' },
      { optionText: 'Heart attack affecting the right side', isCorrect: false, explanation: 'Heart attacks can cause upper abdominal pain but aren\'t triggered by fatty meals specifically.' },
      { optionText: 'Just indigestion - take antacids and ignore it', isCorrect: false, explanation: 'Severe pain with specific pattern after fatty food should be evaluated for gallbladder disease.' }
    ]
  });

  // Question 48: TMJ disorder
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'Your jaw clicks when you chew, you have jaw pain in the morning, and you grind your teeth at night. What condition is this?',
    patientContext: 'Person with jaw pain and dysfunction',
    patientName: 'Frank',
    patientAge: 35,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Jaw clicking, grinding, and morning pain indicate temporomandibular joint problems.',
    answerOptions: [
      { optionText: 'TMJ disorder - see dentist for night guard, try jaw exercises, and apply moist heat', isCorrect: true, explanation: 'Clicking, grinding, and morning jaw pain are classic TMJ disorder symptoms, often from bruxism.' },
      { optionText: 'Tooth cavity causing all these symptoms', isCorrect: false, explanation: 'Cavities don\'t cause clicking or affect jaw movement. This pattern indicates TMJ dysfunction.' },
      { optionText: 'Broken jaw requiring immediate setting', isCorrect: false, explanation: 'A fracture would have occurred with trauma and prevent jaw opening. This is TMJ dysfunction.' },
      { optionText: 'Chew gum constantly to exercise the joint', isCorrect: false, explanation: 'Excessive chewing worsens TMJ disorder. Rest, gentle exercises, and night guards help.' }
    ]
  });

  // Question 49: Perimenopause symptoms
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You\'re 48 and experiencing irregular periods, hot flashes, night sweats, and mood changes. What\'s likely happening?',
    patientContext: 'Woman with hormonal transition symptoms',
    patientName: 'Sharon',
    patientAge: 48,
    difficultyLevel: 'BEGINNER',
    hintText: 'Age-appropriate symptoms of hormonal changes before menopause.',
    answerOptions: [
      { optionText: 'Perimenopause - transition to menopause; discuss symptom management with your doctor', isCorrect: true, explanation: 'These symptoms in late 40s are typical perimenopause. Many treatment options available for symptom relief.' },
      { optionText: 'Definitely pregnancy - take a test', isCorrect: false, explanation: 'While pregnancy should be ruled out, these symptoms at this age more likely indicate perimenopause.' },
      { optionText: 'Serious thyroid disease requiring urgent treatment', isCorrect: false, explanation: 'While thyroid issues should be checked, these are classic perimenopausal symptoms first.' },
      { optionText: 'Normal for all women - no treatment available', isCorrect: false, explanation: 'While common, symptoms can be managed. Many effective treatments exist for quality of life.' }
    ]
  });

  // Question 50: Nosebleed management
  await createQuestion({
    category: 'Common Conditions',
    questionText: 'You have a nosebleed. What\'s the correct way to stop it?',
    patientContext: 'Person with active nosebleed',
    patientName: 'George',
    patientAge: 42,
    difficultyLevel: 'BEGINNER',
    hintText: 'Proper positioning and pressure location are key to stopping nosebleeds.',
    answerOptions: [
      { optionText: 'Sit upright, lean slightly forward, and pinch the soft part of your nose for 10 minutes', isCorrect: true, explanation: 'This position prevents blood from going down the throat while pressure stops bleeding from the anterior septum.' },
      { optionText: 'Lie down flat and tilt your head back', isCorrect: false, explanation: 'This causes blood to flow down the throat, potentially causing nausea and doesn\'t help stop bleeding.' },
      { optionText: 'Stuff tissues up your nose as far as possible', isCorrect: false, explanation: 'This can worsen bleeding and make it difficult to apply proper pressure. Pinch from outside instead.' },
      { optionText: 'Hold an ice pack on your forehead', isCorrect: false, explanation: 'Ice on the bridge of the nose can help, but direct pressure on the soft part is most important.' }
    ]
  });

  console.log('Successfully created 50 common conditions questions!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

