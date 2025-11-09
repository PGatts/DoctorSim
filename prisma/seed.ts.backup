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

  // Sample questions
  const questions = [
    {
      category: 'Preventive Care',
      questionText: 'When should I start getting my cholesterol checked?',
      patientContext: 'A 35-year-old patient asks about cholesterol screening',
      patientName: 'Sarah',
      patientAge: 35,
      difficultyLevel: 'INTERMEDIATE' as const,
      hintText: 'Think about when cardiovascular risk screening typically begins in adults, even for those without symptoms.',
      answerOptions: [
        {
          optionText: 'Starting at age 20, every 5 years',
          isCorrect: true,
          explanation: 'Adults should begin cholesterol screening at age 20 and repeat every 5 years if results are normal. Early screening helps identify risk factors before symptoms appear.',
          educationalResourceLink: 'https://www.heart.org/cholesterol-screening'
        },
        {
          optionText: 'Only if you have symptoms',
          isCorrect: false,
          explanation: 'High cholesterol typically has no symptoms. Waiting for symptoms means missing the opportunity for early prevention.'
        },
        {
          optionText: 'Starting at age 40',
          isCorrect: false,
          explanation: 'While risk increases with age, screening should begin earlier at age 20 to establish a baseline and catch early risks.'
        },
        {
          optionText: 'Only if it runs in your family',
          isCorrect: false,
          explanation: 'While family history increases risk, all adults should be screened regardless of family history.'
        }
      ]
    },
    {
      category: 'Insurance Basics',
      questionText: 'What is a deductible in health insurance?',
      patientContext: 'A confused patient asks about their insurance terms',
      patientName: 'Michael',
      patientAge: 42,
      difficultyLevel: 'BEGINNER' as const,
      hintText: 'This is the amount you pay out-of-pocket before your insurance starts covering costs.',
      answerOptions: [
        {
          optionText: 'The amount you pay before insurance covers services',
          isCorrect: true,
          explanation: 'A deductible is the amount you must pay out-of-pocket for healthcare services before your insurance begins to pay. Once you meet your deductible, insurance typically covers a percentage of costs.'
        },
        {
          optionText: 'The monthly payment for insurance',
          isCorrect: false,
          explanation: 'That\'s called a premium, not a deductible. The premium is what you pay monthly to maintain coverage.'
        },
        {
          optionText: 'The maximum you pay each year',
          isCorrect: false,
          explanation: 'That\'s called an out-of-pocket maximum, which is different from a deductible.'
        },
        {
          optionText: 'The copay for doctor visits',
          isCorrect: false,
          explanation: 'A copay is a fixed amount you pay per visit, while a deductible is a total amount you must meet before insurance coverage begins.'
        }
      ]
    },
    {
      category: 'Medication Management',
      questionText: 'When should I take antibiotics?',
      patientContext: 'Patient has a cold and wants antibiotics',
      patientName: 'Emma',
      patientAge: 28,
      difficultyLevel: 'INTERMEDIATE' as const,
      hintText: 'Consider what type of infections antibiotics are designed to treat.',
      answerOptions: [
        {
          optionText: 'Only for bacterial infections as prescribed',
          isCorrect: true,
          explanation: 'Antibiotics only work against bacterial infections, not viral infections like colds or flu. Taking them unnecessarily contributes to antibiotic resistance.'
        },
        {
          optionText: 'Whenever you have a cold or flu',
          isCorrect: false,
          explanation: 'Colds and flu are caused by viruses. Antibiotics don\'t work against viruses and taking them unnecessarily can be harmful.'
        },
        {
          optionText: 'As a preventive measure when feeling sick',
          isCorrect: false,
          explanation: 'Antibiotics should only be taken when prescribed for a diagnosed bacterial infection, not as prevention or for viral illnesses.'
        },
        {
          optionText: 'Left over from previous prescriptions',
          isCorrect: false,
          explanation: 'Never use leftover antibiotics. Each prescription is specific to a particular infection and should be completed as directed.'
        }
      ]
    },
    {
      category: 'Preventive Care',
      questionText: 'How often should I get a flu vaccine?',
      patientContext: 'Patient asks about flu shot frequency',
      patientName: 'David',
      patientAge: 55,
      difficultyLevel: 'BEGINNER' as const,
      hintText: 'The flu virus changes frequently, requiring updated protection.',
      answerOptions: [
        {
          optionText: 'Annually, every fall',
          isCorrect: true,
          explanation: 'Flu vaccines should be received annually, ideally before flu season begins in the fall. The vaccine is updated each year to match circulating strains.'
        },
        {
          optionText: 'Once in a lifetime',
          isCorrect: false,
          explanation: 'Flu vaccines need to be given annually because flu viruses mutate and change every year.'
        },
        {
          optionText: 'Every 5 years',
          isCorrect: false,
          explanation: 'Unlike some vaccines, flu shots must be given yearly due to the changing nature of influenza viruses.'
        },
        {
          optionText: 'Only when there\'s an outbreak',
          isCorrect: false,
          explanation: 'Vaccination should occur before flu season starts for best protection, not after outbreaks begin.'
        }
      ]
    },
    {
      category: 'Insurance Basics',
      questionText: 'What is a copay?',
      patientContext: 'Patient is confused about payment terms',
      patientName: 'Lisa',
      patientAge: 31,
      difficultyLevel: 'BEGINNER' as const,
      hintText: 'This is a fixed dollar amount you pay at each medical visit.',
      answerOptions: [
        {
          optionText: 'A fixed fee paid at each doctor visit',
          isCorrect: true,
          explanation: 'A copay (or copayment) is a fixed amount you pay for a healthcare service, typically due at the time of service. For example, $25 per doctor visit.'
        },
        {
          optionText: 'The percentage of costs you pay',
          isCorrect: false,
          explanation: 'That\'s coinsurance, not a copay. Copays are fixed amounts, not percentages.'
        },
        {
          optionText: 'The annual insurance cost',
          isCorrect: false,
          explanation: 'Annual cost is related to premiums and deductibles, not copays.'
        },
        {
          optionText: 'Payment for prescription drugs only',
          isCorrect: false,
          explanation: 'Copays apply to various services including doctor visits, emergency room visits, and prescriptions.'
        }
      ]
    },
    {
      category: 'Common Conditions',
      questionText: 'What\'s the difference between Type 1 and Type 2 diabetes?',
      patientContext: 'Patient with family history of diabetes asks for clarification',
      patientName: 'James',
      patientAge: 45,
      difficultyLevel: 'ADVANCED' as const,
      hintText: 'Think about insulin production and when each type typically develops.',
      answerOptions: [
        {
          optionText: 'Type 1 is autoimmune, Type 2 is related to insulin resistance',
          isCorrect: true,
          explanation: 'Type 1 diabetes is an autoimmune condition where the body doesn\'t produce insulin, usually starting in childhood. Type 2 develops when the body becomes resistant to insulin, typically in adults.'
        },
        {
          optionText: 'Type 1 is worse than Type 2',
          isCorrect: false,
          explanation: 'Both types are serious conditions requiring management. They\'re different diseases, not different severities of the same disease.'
        },
        {
          optionText: 'Type 1 only affects children',
          isCorrect: false,
          explanation: 'While Type 1 usually starts in childhood, it can develop at any age. Type 2 is more common in adults but increasingly affects children.'
        },
        {
          optionText: 'They\'re the same, just different names',
          isCorrect: false,
          explanation: 'Type 1 and Type 2 diabetes are distinctly different diseases with different causes, treatments, and management approaches.'
        }
      ]
    },
    {
      category: 'Appointment Preparation',
      questionText: 'What should I bring to my first appointment?',
      patientContext: 'New patient preparing for their first visit',
      patientName: 'Amy',
      patientAge: 26,
      difficultyLevel: 'BEGINNER' as const,
      hintText: 'Think about medical history, current medications, and insurance information.',
      answerOptions: [
        {
          optionText: 'Insurance card, ID, medication list, and medical history',
          isCorrect: true,
          explanation: 'For your first appointment, bring your insurance card, photo ID, a list of current medications, and information about your medical history including past surgeries and family history.'
        },
        {
          optionText: 'Just your insurance card',
          isCorrect: false,
          explanation: 'While insurance is important, you should also bring medications, medical history, and identification.'
        },
        {
          optionText: 'Nothing - they have everything on file',
          isCorrect: false,
          explanation: 'As a new patient, the office won\'t have your information yet. Always bring necessary documentation to first visits.'
        },
        {
          optionText: 'Only your symptoms written down',
          isCorrect: false,
          explanation: 'While documenting symptoms is helpful, you also need insurance, ID, and medication information.'
        }
      ]
    },
    {
      category: 'Medication Management',
      questionText: 'Can I stop taking medication if I feel better?',
      patientContext: 'Patient on blood pressure medication feels fine',
      patientName: 'Robert',
      patientAge: 58,
      difficultyLevel: 'INTERMEDIATE' as const,
      hintText: 'Consider whether feeling better means the condition is cured or just controlled.',
      answerOptions: [
        {
          optionText: 'No, consult your doctor before stopping any medication',
          isCorrect: true,
          explanation: 'Never stop prescribed medications without consulting your doctor. Feeling better often means the medication is working, not that you\'re cured. Stopping can cause serious complications.'
        },
        {
          optionText: 'Yes, if you feel completely normal',
          isCorrect: false,
          explanation: 'Feeling normal might mean the medication is working effectively. Stopping could cause your condition to worsen.'
        },
        {
          optionText: 'Yes, medications are only needed when you have symptoms',
          isCorrect: false,
          explanation: 'Many conditions like high blood pressure have no symptoms but still require ongoing treatment to prevent serious complications.'
        },
        {
          optionText: 'Stop for a week to test if you still need it',
          isCorrect: false,
          explanation: 'Experimenting with your medications can be dangerous. Always consult your healthcare provider before making any changes.'
        }
      ]
    }
  ];

  console.log('Creating questions and answer options...');
  
  for (const q of questions) {
    const { answerOptions, ...questionData } = q;
    
    const question = await prisma.question.create({
      data: {
        ...questionData,
        answerOptions: {
          create: answerOptions
        }
      },
      include: {
        answerOptions: true
      }
    });
    
    console.log(`Created question: ${question.questionText.substring(0, 50)}...`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

