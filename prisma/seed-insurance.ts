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

  console.log('Creating 25 insurance basics questions...');
  
  // Question 1: Deductible basics
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your health insurance has a $1,500 deductible. What does this mean?',
    patientContext: 'New insurance member learning about deductibles',
    patientName: 'Alex',
    patientAge: 26,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about what you must pay before insurance starts covering costs.',
    answerOptions: [
      { optionText: 'You pay the first $1,500 of covered medical expenses each year before insurance pays', isCorrect: true, explanation: 'The deductible is your out-of-pocket responsibility before insurance coverage begins for most services.' },
      { optionText: 'You pay $1,500 every month for coverage', isCorrect: false, explanation: 'That would be your premium, not deductible. Deductible is what you pay per year for services before coverage starts.' },
      { optionText: 'Insurance pays $1,500 and you pay the rest', isCorrect: false, explanation: 'This is backwards - you pay the deductible amount first, then insurance helps with additional costs.' },
      { optionText: 'The maximum you\'ll ever pay for healthcare in a year', isCorrect: false, explanation: 'That\'s your out-of-pocket maximum, which is typically higher than your deductible.' }
    ]
  });

  // Question 2: In-network vs out-of-network scenario
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your insurance has a $30 copay for in-network specialists and 40% coinsurance for out-of-network. A specialist visit costs $200. You chose an out-of-network doctor. How much do you pay?',
    patientContext: 'Patient calculating out-of-network costs',
    patientName: 'Rachel',
    patientAge: 34,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Out-of-network means coinsurance applies, not the flat copay.',
    answerOptions: [
      { optionText: '$80 (40% of $200), plus any amount above what insurance considers reasonable', isCorrect: true, explanation: 'With out-of-network providers, you pay coinsurance (40% = $80) plus any charges above what your plan deems reasonable and customary.' },
      { optionText: 'Just the $30 copay, same as in-network', isCorrect: false, explanation: 'Copays typically apply only to in-network providers. Out-of-network uses different cost-sharing.' },
      { optionText: '$170 ($200 minus $30 copay)', isCorrect: false, explanation: 'Copays don\'t apply to out-of-network care. You pay coinsurance plus potential balance billing.' },
      { optionText: 'Nothing - insurance always pays 100% for specialists', isCorrect: false, explanation: 'Insurance rarely pays 100% for specialists, especially out-of-network where you pay coinsurance.' }
    ]
  });

  // Question 3: Premium payment importance
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You haven\'t paid your insurance premium for 2 months. What happens?',
    patientContext: 'Person behind on insurance payments',
    patientName: 'Marcus',
    patientAge: 41,
    difficultyLevel: 'BEGINNER',
    hintText: 'Premiums must be paid to maintain active coverage.',
    answerOptions: [
      { optionText: 'Your coverage will be terminated, leaving you uninsured and responsible for all medical costs', isCorrect: true, explanation: 'Unpaid premiums lead to coverage termination. You must pay to reinstate or find new coverage during open enrollment.' },
      { optionText: 'They\'ll just add it to your deductible', isCorrect: false, explanation: 'Deductibles are separate from premiums. Unpaid premiums result in coverage termination.' },
      { optionText: 'Nothing - they can\'t cancel your insurance', isCorrect: false, explanation: 'Non-payment of premiums is grounds for cancellation. Maintaining payment is crucial for coverage.' },
      { optionText: 'Insurance continues but won\'t cover anything until you pay', isCorrect: false, explanation: 'Coverage is terminated with non-payment, not just suspended. You\'d be completely uninsured.' }
    ]
  });

  // Question 4: Coinsurance explanation
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'After meeting your deductible, your plan has 20% coinsurance. A surgery costs $10,000. What do you pay?',
    patientContext: 'Patient understanding cost-sharing after deductible',
    patientName: 'Jennifer',
    patientAge: 47,
    difficultyLevel: 'BEGINNER',
    hintText: 'Coinsurance is the percentage you pay after the deductible is met.',
    answerOptions: [
      { optionText: '$2,000 (20% of $10,000), assuming you\'ve met your deductible', isCorrect: true, explanation: 'Coinsurance means you pay a percentage of costs after your deductible. 20% of $10,000 = $2,000.' },
      { optionText: '$20 - that\'s the standard copay', isCorrect: false, explanation: 'A $20 copay might apply to office visits, but surgeries typically involve coinsurance percentages.' },
      { optionText: '$8,000 (80% because insurance pays 20%)', isCorrect: false, explanation: 'This is backwards - you pay 20% ($2,000) and insurance pays 80% ($8,000).' },
      { optionText: 'Nothing - insurance covers everything after deductible', isCorrect: false, explanation: 'Most plans require coinsurance (cost-sharing) even after meeting your deductible.' }
    ]
  });

  // Question 5: Out-of-pocket maximum
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your insurance has a $6,000 out-of-pocket maximum. You\'ve paid $5,800 this year. A $1,000 procedure is scheduled. What will you pay?',
    patientContext: 'Patient near out-of-pocket maximum',
    patientName: 'David',
    patientAge: 52,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'The out-of-pocket maximum limits your total annual spending.',
    answerOptions: [
      { optionText: '$200 - that brings you to the $6,000 maximum, then insurance pays 100% the rest of the year', isCorrect: true, explanation: 'Once you hit your out-of-pocket max, insurance covers 100% of covered services for the rest of the year.' },
      { optionText: '$1,000 - you always pay the full cost', isCorrect: false, explanation: 'The out-of-pocket maximum protects you from unlimited costs. You only pay $200 more to reach it.' },
      { optionText: '$6,000 - the maximum starts over with each procedure', isCorrect: false, explanation: 'The out-of-pocket max is annual, not per-procedure. It accumulates throughout the year.' },
      { optionText: 'Nothing - you\'ve already met 97% of the maximum', isCorrect: false, explanation: 'Being close to the maximum doesn\'t mean hitting it. You must actually reach $6,000 spent.' }
    ]
  });

  // Question 6: Pre-authorization scenario
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your doctor orders an MRI, and the imaging center says you need "pre-authorization." What does this mean?',
    patientContext: 'Patient needing approval for diagnostic test',
    patientName: 'Lisa',
    patientAge: 38,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Some services require insurance approval before they\'re performed.',
    answerOptions: [
      { optionText: 'Your insurance must approve the MRI as medically necessary before they\'ll cover it', isCorrect: true, explanation: 'Pre-authorization means your doctor must justify the test\'s medical necessity to insurance before it\'s done.' },
      { optionText: 'You need to pay for the MRI upfront before getting it', isCorrect: false, explanation: 'Pre-authorization is about insurance approval, not payment timing. You typically pay after the service.' },
      { optionText: 'The MRI must be scheduled at least 30 days in advance', isCorrect: false, explanation: 'Pre-authorization is about medical approval, not scheduling timelines.' },
      { optionText: 'It means the MRI isn\'t covered and you\'ll pay full price', isCorrect: false, explanation: 'Pre-authorization doesn\'t mean non-coverage; it means insurance wants to review necessity first.' }
    ]
  });

  // Question 7: EOB understanding
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You received an "Explanation of Benefits" (EOB) after a doctor visit. Is this a bill?',
    patientContext: 'Patient confused about EOB document',
    patientName: 'Thomas',
    patientAge: 29,
    difficultyLevel: 'BEGINNER',
    hintText: 'An EOB explains what insurance did, not what you owe.',
    answerOptions: [
      { optionText: 'No - it shows what was billed, what insurance paid, and what you may owe, but wait for the actual bill', isCorrect: true, explanation: 'EOBs are informational documents from insurance. The provider sends the actual bill for any amount you owe.' },
      { optionText: 'Yes - pay the EOB amount immediately to avoid collections', isCorrect: false, explanation: 'EOBs aren\'t bills. Don\'t pay based on an EOB; wait for the provider\'s actual bill.' },
      { optionText: 'It\'s a bill only if it has your name at the top', isCorrect: false, explanation: 'All EOBs have your name, but they\'re never bills. They\'re insurance statements.' },
      { optionText: 'EOBs and bills are exactly the same thing', isCorrect: false, explanation: 'EOBs are from insurance companies explaining coverage; bills are from providers requesting payment.' }
    ]
  });

  // Question 8: Emergency room coverage
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You\'re traveling and have a medical emergency. The nearest ER is out-of-network. Will your insurance cover it?',
    patientContext: 'Traveler needing emergency care',
    patientName: 'Sarah',
    patientAge: 31,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Emergency services have special rules regardless of network status.',
    answerOptions: [
      { optionText: 'Yes - emergency care must be covered at in-network rates even at out-of-network hospitals', isCorrect: true, explanation: 'Federal law requires insurance to cover emergency care at in-network cost-sharing, regardless of hospital network status.' },
      { optionText: 'No - out-of-network ERs are never covered', isCorrect: false, explanation: 'Emergency care is specially protected. You can\'t be penalized for going to the nearest ER in an emergency.' },
      { optionText: 'Only if you called insurance for approval first', isCorrect: false, explanation: 'Emergencies don\'t require pre-authorization. Get care first, then notify insurance as required.' },
      { optionText: 'Coverage depends on what state you\'re in', isCorrect: false, explanation: 'Federal protections for emergency care apply nationwide, regardless of where the emergency occurs.' }
    ]
  });

  // Question 9: Preventive care coverage
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your insurance covers "preventive care at 100%." What does this include?',
    patientContext: 'Patient asking about free preventive services',
    patientName: 'Michael',
    patientAge: 44,
    difficultyLevel: 'BEGINNER',
    hintText: 'Certain preventive services are required to be free under the Affordable Care Act.',
    answerOptions: [
      { optionText: 'Annual physicals, certain screenings, and immunizations with no copay or deductible', isCorrect: true, explanation: 'ACA-required preventive services must be covered at 100% with in-network providers, including checkups and screenings.' },
      { optionText: 'Only flu shots - everything else has normal cost-sharing', isCorrect: false, explanation: 'Many preventive services beyond flu shots are covered at 100%, including physicals and cancer screenings.' },
      { optionText: 'All doctor visits are completely free', isCorrect: false, explanation: 'Only designated preventive services are free. Sick visits and treatments still have copays/deductibles.' },
      { optionText: 'Preventive care is free only if you never get sick', isCorrect: false, explanation: 'Preventive services are covered at 100% for everyone, regardless of your health status.' }
    ]
  });

  // Question 10: FSA vs HSA
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'What\'s a key difference between an FSA (Flexible Spending Account) and HSA (Health Savings Account)?',
    patientContext: 'Employee choosing between savings accounts',
    patientName: 'Emily',
    patientAge: 33,
    difficultyLevel: 'ADVANCED',
    hintText: 'One has "use it or lose it" rules, while the other lets you keep funds indefinitely.',
    answerOptions: [
      { optionText: 'FSA funds must be used by year-end or forfeited; HSA funds roll over indefinitely', isCorrect: true, explanation: 'FSAs have use-it-or-lose-it rules (with some grace period). HSAs are yours forever, even if you change jobs.' },
      { optionText: 'FSAs are only for retirement, HSAs are for current medical expenses', isCorrect: false, explanation: 'Both are for current medical expenses. HSAs can be used in retirement, but that\'s not their primary purpose.' },
      { optionText: 'FSAs have higher contribution limits than HSAs', isCorrect: false, explanation: 'HSAs typically allow higher contributions than FSAs, especially for families.' },
      { optionText: 'They\'re the same thing with different names', isCorrect: false, explanation: 'FSAs and HSAs have significantly different rules regarding rollovers, eligibility, and portability.' }
    ]
  });

  // Question 11: COBRA after job loss
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You lost your job. Your employer offers "COBRA continuation." What is this?',
    patientContext: 'Recently unemployed person learning about options',
    patientName: 'Robert',
    patientAge: 48,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'COBRA lets you keep your employer plan, but at a cost.',
    answerOptions: [
      { optionText: 'You can continue your employer\'s health plan for 18 months, but you pay the full premium plus 2%', isCorrect: true, explanation: 'COBRA lets you keep your coverage temporarily, but you pay what your employer paid plus your portion (102% of total premium).' },
      { optionText: 'Free insurance for unemployed people', isCorrect: false, explanation: 'COBRA isn\'t free - you pay the full premium. It\'s often expensive but provides continuity of care.' },
      { optionText: 'A government program that replaces your insurance', isCorrect: false, explanation: 'COBRA continues your existing employer plan; it\'s not a government insurance program.' },
      { optionText: 'Required insurance your new employer must provide', isCorrect: false, explanation: 'COBRA is from your former employer. New employers have separate coverage with waiting periods.' }
    ]
  });

  // Question 12: Generic vs brand medication
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your medication has a generic option costing $10 or brand name costing $75. Your insurance requires "generic substitution unless medically necessary." What does this mean?',
    patientContext: 'Patient prescribed medication with generic available',
    patientName: 'Patricia',
    patientAge: 56,
    difficultyLevel: 'BEGINNER',
    hintText: 'Insurance prefers generic medications when they\'re equivalent.',
    answerOptions: [
      { optionText: 'Insurance covers the generic; for brand name, you need doctor documentation why generic won\'t work', isCorrect: true, explanation: 'Most plans require trying generics first. Your doctor must justify medical necessity for coverage of more expensive brand names.' },
      { optionText: 'You can choose either one and pay the same amount', isCorrect: false, explanation: 'Brand names cost more. Insurance incentivizes generics through lower copays and may require authorization for brands.' },
      { optionText: 'Generic medications don\'t work as well as brand names', isCorrect: false, explanation: 'FDA-approved generics have the same active ingredients and effectiveness as brand names.' },
      { optionText: 'This only applies to over-the-counter medications', isCorrect: false, explanation: 'Generic substitution applies to prescription medications. OTC drugs typically aren\'t covered by insurance.' }
    ]
  });

  // Question 13: Claim denial and appeals
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your insurance denied coverage for a procedure your doctor says you need. What\'s your next step?',
    patientContext: 'Patient facing insurance denial',
    patientName: 'James',
    patientAge: 42,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'You have the right to challenge insurance decisions.',
    answerOptions: [
      { optionText: 'File an appeal with supporting documentation from your doctor explaining medical necessity', isCorrect: true, explanation: 'Insurance denials can be appealed. Many denials are overturned with proper documentation of medical necessity.' },
      { optionText: 'Accept the denial - insurance decisions are final and can\'t be challenged', isCorrect: false, explanation: 'You always have the right to appeal denials. Many appeals succeed, especially with doctor support.' },
      { optionText: 'Immediately pay for the procedure yourself without question', isCorrect: false, explanation: 'Before paying out-of-pocket, file an appeal. You may win coverage or buy time to explore options.' },
      { optionText: 'Switch insurance companies right away', isCorrect: false, explanation: 'You can only switch during open enrollment or qualifying events. Appeal the denial first.' }
    ]
  });

  // Question 14: Dependent coverage age
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Until what age can children typically stay on their parent\'s health insurance?',
    patientContext: 'Parent with college-age child',
    patientName: 'Karen',
    patientAge: 49,
    difficultyLevel: 'BEGINNER',
    hintText: 'The Affordable Care Act extended dependent coverage significantly.',
    answerOptions: [
      { optionText: 'Age 26, regardless of student status, marriage, or financial dependence', isCorrect: true, explanation: 'Under the ACA, children can stay on parental insurance until age 26, even if married, not in school, or financially independent.' },
      { optionText: 'Age 18, or 22 if in college', isCorrect: false, explanation: 'This was true before the ACA, but coverage now extends to age 26 for all young adults.' },
      { optionText: 'Age 21 for all dependents', isCorrect: false, explanation: 'The ACA allows coverage until 26, not 21, regardless of circumstances.' },
      { optionText: 'Any age as long as they live at home', isCorrect: false, explanation: 'Living situation doesn\'t determine eligibility. Coverage ends at 26 even if they live at home.' }
    ]
  });

  // Question 15: Medicare basics
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You\'re turning 65 next month. When can you enroll in Medicare?',
    patientContext: 'Person approaching Medicare eligibility',
    patientName: 'William',
    patientAge: 64,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Medicare has a specific enrollment window around your 65th birthday.',
    answerOptions: [
      { optionText: '3 months before your 65th birthday through 3 months after (7-month window)', isCorrect: true, explanation: 'The Initial Enrollment Period is 7 months: 3 months before, your birthday month, and 3 months after you turn 65.' },
      { optionText: 'Only on your exact 65th birthday', isCorrect: false, explanation: 'You have a 7-month window, not just one day. Coverage can start as early as the month you turn 65.' },
      { optionText: 'Anytime after age 65 with no penalties', isCorrect: false, explanation: 'Missing your Initial Enrollment Period can result in late enrollment penalties and coverage gaps.' },
      { optionText: 'Not until you fully retire and stop working', isCorrect: false, explanation: 'Most people should enroll at 65 even if working, though some with employer coverage can delay Part B.' }
    ]
  });

  // Question 16: Surprise medical billing
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You had surgery at an in-network hospital, but the anesthesiologist was out-of-network and sent a $3,000 bill. What protection do you have?',
    patientContext: 'Patient receiving unexpected out-of-network bill',
    patientName: 'Sandra',
    patientAge: 39,
    difficultyLevel: 'ADVANCED',
    hintText: 'New federal laws protect against surprise billing in certain situations.',
    answerOptions: [
      { optionText: 'The No Surprises Act protects you - the out-of-network provider can only charge you the in-network amount', isCorrect: true, explanation: 'Federal law (2022) protects patients from surprise bills for out-of-network providers at in-network facilities.' },
      { optionText: 'You must pay the full $3,000 out-of-pocket since they were out-of-network', isCorrect: false, explanation: 'The No Surprises Act specifically addresses this situation. You\'re protected from unexpected out-of-network charges.' },
      { optionText: 'This only applies if you live in certain states', isCorrect: false, explanation: 'The No Surprises Act is federal law applying to all states, not just some.' },
      { optionText: 'You should have checked every provider\'s network status before surgery', isCorrect: false, explanation: 'While verification is smart, federal law recognizes patients can\'t always control every provider involved in their care.' }
    ]
  });

  // Question 17: Prescription tier system
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your prescription drug plan has 4 tiers. Your medication is "Tier 3." What does this typically mean?',
    patientContext: 'Patient learning about drug coverage',
    patientName: 'Donald',
    patientAge: 61,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Higher tier numbers generally mean higher costs.',
    answerOptions: [
      { optionText: 'Preferred brand-name drug; higher copay than generic (Tier 1-2) but lower than specialty drugs (Tier 4)', isCorrect: true, explanation: 'Tier systems rank drugs by cost: Tier 1 (generic), Tier 2 (preferred generic), Tier 3 (brand), Tier 4 (specialty).' },
      { optionText: 'The cheapest possible medication option', isCorrect: false, explanation: 'Tier 1 drugs are cheapest (usually generics). Tier 3 indicates a more expensive brand-name medication.' },
      { optionText: 'Not covered by insurance at all', isCorrect: false, explanation: 'Tier 3 drugs are covered but cost more than lower tiers. Non-covered drugs wouldn\'t have a tier.' },
      { optionText: 'Available only through mail order', isCorrect: false, explanation: 'Tier number indicates cost level, not where you get the medication. Any tier can be retail or mail-order.' }
    ]
  });

  // Question 18: Special enrollment period
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You missed open enrollment but just got married. Can you get health insurance now?',
    patientContext: 'Newly married person needing coverage outside open enrollment',
    patientName: 'Jessica',
    patientAge: 28,
    difficultyLevel: 'BEGINNER',
    hintText: 'Certain life events create special enrollment opportunities.',
    answerOptions: [
      { optionText: 'Yes - marriage is a qualifying life event giving you 60 days to enroll', isCorrect: true, explanation: 'Marriage, birth, job loss, and moving create Special Enrollment Periods for getting coverage outside open enrollment.' },
      { optionText: 'No - you must wait until next year\'s open enrollment', isCorrect: false, explanation: 'Major life changes like marriage trigger special enrollment rights, allowing immediate coverage access.' },
      { optionText: 'Only if your spouse doesn\'t have insurance either', isCorrect: false, explanation: 'Marriage qualifies you for special enrollment regardless of your spouse\'s insurance status.' },
      { optionText: 'Yes, but only for one month of coverage', isCorrect: false, explanation: 'Special enrollment lets you get full year-round coverage, not just temporary insurance.' }
    ]
  });

  // Question 19: Prior authorization wait time
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your doctor submitted a prior authorization request to insurance 3 weeks ago for your medication. You still haven\'t heard back. What should you do?',
    patientContext: 'Patient waiting for insurance approval',
    patientName: 'Steven',
    patientAge: 45,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Insurance companies have required response timeframes.',
    answerOptions: [
      { optionText: 'Call insurance immediately - they typically must respond within 72 hours for urgent requests, 15 days for non-urgent', isCorrect: true, explanation: 'Insurance has legal timeframes for authorization decisions. Call to check status and escalate if needed.' },
      { optionText: 'Wait patiently - they can take up to 6 months to decide', isCorrect: false, explanation: 'State and federal laws require timely decisions. Three weeks is longer than typical required timeframes.' },
      { optionText: 'Assume it was denied and give up on the medication', isCorrect: false, explanation: 'No response means you should follow up, not assume denial. Your doctor can also help escalate.' },
      { optionText: 'File a lawsuit against the insurance company', isCorrect: false, explanation: 'Before legal action, call to check status, file a complaint if needed, or work with your doctor to resubmit.' }
    ]
  });

  // Question 20: Balance billing
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your insurance paid $800 for a $1,200 out-of-network doctor visit. The doctor is now billing you for the remaining $400. What is this called?',
    patientContext: 'Patient facing additional charges beyond insurance payment',
    patientName: 'Nancy',
    patientAge: 53,
    difficultyLevel: 'ADVANCED',
    hintText: 'When providers bill for the difference between their charge and insurance payment.',
    answerOptions: [
      { optionText: 'Balance billing - out-of-network providers can charge you the difference beyond insurance payment', isCorrect: true, explanation: 'Balance billing is when providers charge patients the difference between their fee and what insurance pays. This is why in-network care is cheaper.' },
      { optionText: 'Fraud - providers can never charge more than what insurance pays', isCorrect: false, explanation: 'Balance billing is legal for out-of-network providers in most situations (except emergencies and surprise billing scenarios).' },
      { optionText: 'Copay - the standard fee for seeing any doctor', isCorrect: false, explanation: 'A copay is a fixed amount. Balance billing is variable based on the difference between charges and insurance payment.' },
      { optionText: 'Coinsurance - your percentage of the cost', isCorrect: false, explanation: 'Coinsurance is your percentage of allowed amount. Balance billing is additional charges beyond what insurance considers reasonable.' }
    ]
  });

  // Question 21: Medicaid basics
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'What\'s the main difference between Medicare and Medicaid?',
    patientContext: 'Person confused about government insurance programs',
    patientName: 'Betty',
    patientAge: 58,
    difficultyLevel: 'BEGINNER',
    hintText: 'One is based on age/disability, the other on income.',
    answerOptions: [
      { optionText: 'Medicare is for people 65+ and disabled; Medicaid is for low-income individuals and families', isCorrect: true, explanation: 'Medicare is primarily age-based (65+) or disability-based. Medicaid is need-based for low-income people of any age.' },
      { optionText: 'They\'re the same program with different names in different states', isCorrect: false, explanation: 'Medicare and Medicaid are separate programs with different eligibility criteria and benefits.' },
      { optionText: 'Medicare is state-run; Medicaid is federal', isCorrect: false, explanation: 'Actually the opposite - Medicare is federal, while Medicaid is run by states following federal guidelines.' },
      { optionText: 'Medicaid is only for children under 18', isCorrect: false, explanation: 'Medicaid covers eligible people of all ages, including children, adults, elderly, and disabled individuals.' }
    ]
  });

  // Question 22: HMO vs PPO
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'Your employer offers an HMO and a PPO plan. What\'s a key difference?',
    patientContext: 'Employee choosing between plan types',
    patientName: 'Charles',
    patientAge: 37,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Think about referrals and flexibility in choosing providers.',
    answerOptions: [
      { optionText: 'HMO requires choosing a primary care doctor and getting referrals for specialists; PPO allows direct specialist access', isCorrect: true, explanation: 'HMOs manage care through a primary doctor who coordinates referrals. PPOs offer more flexibility to see any provider.' },
      { optionText: 'HMO costs more but offers better coverage than PPO', isCorrect: false, explanation: 'Typically, HMOs cost less than PPOs but have more restrictions on provider choice and require referrals.' },
      { optionText: 'PPO plans don\'t cover emergencies; HMO plans do', isCorrect: false, explanation: 'Both plan types cover emergencies. The main differences are in how you access routine and specialist care.' },
      { optionText: 'They\'re exactly the same thing', isCorrect: false, explanation: 'HMO and PPO plans have significant differences in provider networks, referral requirements, and out-of-network coverage.' }
    ]
  });

  // Question 23: Coverage start date
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You enrolled in new insurance on March 20th. When does your coverage typically begin?',
    patientContext: 'Person starting new insurance plan',
    patientName: 'Dorothy',
    patientAge: 43,
    difficultyLevel: 'BEGINNER',
    hintText: 'Coverage usually starts the first of the month.',
    answerOptions: [
      { optionText: 'April 1st - coverage typically begins the first of the month after enrollment', isCorrect: true, explanation: 'Most insurance starts on the first day of the month following enrollment. March 20 enrollment means April 1 coverage.' },
      { optionText: 'March 20th - the day you enrolled', isCorrect: false, explanation: 'Coverage doesn\'t usually start immediately. There\'s typically a waiting period until the first of the following month.' },
      { optionText: 'March 1st - retroactive to the start of enrollment month', isCorrect: false, explanation: 'Insurance isn\'t retroactive except in special circumstances. Coverage starts after enrollment, not before.' },
      { optionText: 'Coverage begins only after you visit a doctor and pay a copay', isCorrect: false, explanation: 'Coverage starts automatically on the effective date. You don\'t need to see a doctor for it to begin.' }
    ]
  });

  // Question 24: Catastrophic health plans
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You\'re 27 and healthy. A "catastrophic" health plan has a low premium but $9,000 deductible. What\'s this plan designed for?',
    patientContext: 'Young person evaluating plan options',
    patientName: 'Michelle',
    patientAge: 27,
    difficultyLevel: 'ADVANCED',
    hintText: 'These plans protect against major medical expenses, not routine care.',
    answerOptions: [
      { optionText: 'Protection against very high medical costs from serious illness/injury while keeping premiums low', isCorrect: true, explanation: 'Catastrophic plans are for young, healthy people who want affordable premiums and protection from worst-case scenarios.' },
      { optionText: 'Plans for people with catastrophic illnesses only', isCorrect: false, explanation: 'Anyone under 30 (or with hardship exemption) can buy catastrophic plans. They\'re not just for sick people.' },
      { optionText: 'The best plan for someone who sees doctors frequently', isCorrect: false, explanation: 'High deductibles make catastrophic plans poor for frequent care. They\'re best for healthy people with minimal medical needs.' },
      { optionText: 'Plans that don\'t cover preventive care', isCorrect: false, explanation: 'Even catastrophic plans must cover preventive services at 100% before the deductible, per ACA requirements.' }
    ]
  });

  // Question 25: Insurance marketplace subsidy
  await createQuestion({
    category: 'Insurance Basics',
    questionText: 'You\'re buying insurance through the Health Insurance Marketplace. It asks about your income. Why does this matter?',
    patientContext: 'Individual shopping for marketplace insurance',
    patientName: 'Paul',
    patientAge: 35,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Your income determines if you qualify for financial help.',
    answerOptions: [
      { optionText: 'You may qualify for premium subsidies (tax credits) that lower your monthly insurance cost', isCorrect: true, explanation: 'Income determines eligibility for premium tax credits that can significantly reduce your insurance costs.' },
      { optionText: 'Higher income people get better insurance plans', isCorrect: false, explanation: 'Income affects subsidies, not plan quality. Everyone can buy the same plans; subsidies help lower earners afford them.' },
      { optionText: 'Income determines your deductible amount', isCorrect: false, explanation: 'Deductibles are set by the plan you choose, not your income. Income only affects subsidy eligibility.' },
      { optionText: 'The marketplace is only for people below the poverty line', isCorrect: false, explanation: 'The marketplace serves people at various income levels. Subsidies extend well above poverty level (up to 400% FPL).' }
    ]
  });

  console.log('Successfully created 25 insurance basics questions!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

