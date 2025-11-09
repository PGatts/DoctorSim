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

  console.log('Creating 10 appointment preparation questions...');
  
  // Question 1: What to bring - checklist style
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'What should I bring to my first appointment with a new doctor?',
    patientContext: 'New patient preparing for initial consultation',
    patientName: 'Marcus',
    patientAge: 42,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about what information helps doctors understand your complete health history.',
    answerOptions: [
      { 
        optionText: 'Insurance card, photo ID, medication list, and medical records', 
        isCorrect: true, 
        explanation: 'These essential items help your doctor provide the best care by understanding your health history and ensuring proper billing.' 
      },
      { 
        optionText: 'Just your insurance card', 
        isCorrect: false, 
        explanation: 'While insurance is important, doctors need more information about your health history and current medications.' 
      },
      { 
        optionText: 'Nothing - the doctor has everything on file', 
        isCorrect: false, 
        explanation: 'A new doctor won\'t have your previous records unless you provide them.' 
      },
      { 
        optionText: 'Only bring items if you\'re having surgery', 
        isCorrect: false, 
        explanation: 'Even routine appointments require proper documentation and identification.' 
      }
    ]
  });

  // Question 2: Situational - medication timing
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'You take blood pressure medication every morning. Your appointment is at 11 AM and requires fasting bloodwork. When should you take your medication?',
    patientContext: 'Patient with morning appointment and fasting requirements',
    patientName: 'Sandra',
    patientAge: 58,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Most medications can be taken with small sips of water, but you should always verify with your doctor.',
    answerOptions: [
      { 
        optionText: 'Take it as scheduled with a small sip of water, then ask the staff when you arrive', 
        isCorrect: true, 
        explanation: 'Blood pressure medication should generally be taken on schedule. A small amount of water won\'t affect fasting labs.' 
      },
      { 
        optionText: 'Skip the medication completely until after your appointment', 
        isCorrect: false, 
        explanation: 'Skipping blood pressure medication can be dangerous and cause readings to be artificially high.' 
      },
      { 
        optionText: 'Take it with a full breakfast to avoid side effects', 
        isCorrect: false, 
        explanation: 'This breaks your fast and could invalidate the bloodwork results.' 
      },
      { 
        optionText: 'Take it right before the appointment instead of morning', 
        isCorrect: false, 
        explanation: 'Changing medication timing without doctor approval can affect both the medication\'s effectiveness and your blood pressure reading.' 
      }
    ]
  });

  // Question 3: Questions to ask format
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'Which question is MOST important to ask your doctor when they prescribe a new medication?',
    patientContext: 'Patient receiving new prescription',
    patientName: 'Derek',
    patientAge: 35,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Consider what information is critical for taking medication safely and effectively.',
    answerOptions: [
      { 
        optionText: 'How and when should I take this medication, and what are potential side effects?', 
        isCorrect: true, 
        explanation: 'Understanding dosing instructions and potential side effects is essential for medication safety and effectiveness.' 
      },
      { 
        optionText: 'Is there a generic version available?', 
        isCorrect: false, 
        explanation: 'While cost is important, safety information about how to take the medication properly comes first.' 
      },
      { 
        optionText: 'Can I get samples to try first?', 
        isCorrect: false, 
        explanation: 'Samples may be helpful, but understanding proper use and side effects is more critical.' 
      },
      { 
        optionText: 'What if I forget to take a dose?', 
        isCorrect: false, 
        explanation: 'This is a good question, but less urgent than understanding basic dosing and side effects.' 
      }
    ]
  });

  // Question 4: Symptom tracking scenario
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'You\'ve been having headaches for 3 weeks and finally scheduled a doctor visit. What\'s the BEST way to prepare?',
    patientContext: 'Patient with recurring symptoms preparing for appointment',
    patientName: 'Rachel',
    patientAge: 29,
    difficultyLevel: 'BEGINNER',
    hintText: 'Detailed information about symptoms helps doctors make accurate diagnoses.',
    answerOptions: [
      { 
        optionText: 'Keep a symptom diary noting when headaches occur, how long they last, and any triggers', 
        isCorrect: true, 
        explanation: 'A symptom diary provides valuable patterns that help doctors diagnose and treat effectively.' 
      },
      { 
        optionText: 'Just describe the headaches from memory during the appointment', 
        isCorrect: false, 
        explanation: 'Memory alone often misses important patterns and details that help with diagnosis.' 
      },
      { 
        optionText: 'Wait to see if they get worse before documenting anything', 
        isCorrect: false, 
        explanation: 'Tracking symptoms from the start provides more useful diagnostic information.' 
      },
      { 
        optionText: 'Take pain medication before the appointment so you feel better', 
        isCorrect: false, 
        explanation: 'This might mask symptoms the doctor needs to assess and doesn\'t provide diagnostic information.' 
      }
    ]
  });

  // Question 5: Annual physical preparation
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'Your annual physical is next week. What preparation is typically required?',
    patientContext: 'Patient preparing for routine annual exam',
    patientName: 'Jason',
    patientAge: 45,
    difficultyLevel: 'BEGINNER',
    hintText: 'Annual physicals often include bloodwork that requires specific preparation.',
    answerOptions: [
      { 
        optionText: 'Fast for 8-12 hours before the appointment if bloodwork is ordered', 
        isCorrect: true, 
        explanation: 'Fasting ensures accurate cholesterol and glucose readings. Always confirm fasting requirements when scheduling.' 
      },
      { 
        optionText: 'No preparation needed - just show up', 
        isCorrect: false, 
        explanation: 'Most physicals include bloodwork that requires fasting for accurate results.' 
      },
      { 
        optionText: 'Avoid all medications for 24 hours beforehand', 
        isCorrect: false, 
        explanation: 'Never stop medications without doctor approval. Most can be taken before bloodwork.' 
      },
      { 
        optionText: 'Exercise heavily the morning of to show you\'re healthy', 
        isCorrect: false, 
        explanation: 'Heavy exercise can affect some test results and isn\'t recommended before bloodwork.' 
      }
    ]
  });

  // Question 6: Specialist referral scenario
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'Your primary care doctor referred you to a cardiologist. It\'s a month away. What should you do in the meantime?',
    patientContext: 'Patient with specialist referral and waiting period',
    patientName: 'Patricia',
    patientAge: 62,
    difficultyLevel: 'ADVANCED',
    hintText: 'Gathering information ahead of time makes specialist visits more productive.',
    answerOptions: [
      { 
        optionText: 'Request your medical records, prepare questions, and document any new symptoms', 
        isCorrect: true, 
        explanation: 'Proactive preparation ensures the specialist has complete information and you get the most from the visit.' 
      },
      { 
        optionText: 'Do nothing - the specialist will get all information from your primary doctor', 
        isCorrect: false, 
        explanation: 'Records don\'t always transfer automatically, and you may have valuable information to add.' 
      },
      { 
        optionText: 'Cancel if you start feeling better', 
        isCorrect: false, 
        explanation: 'Symptom improvement doesn\'t mean the underlying issue is resolved. Keep the appointment unless your doctor advises otherwise.' 
      },
      { 
        optionText: 'Wait until the day before to think about what to discuss', 
        isCorrect: false, 
        explanation: 'Last-minute preparation often means forgetting important details and questions.' 
      }
    ]
  });

  // Question 7: Test results preparation
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'You\'re seeing your doctor to discuss test results that were concerning. How should you prepare?',
    patientContext: 'Follow-up appointment for abnormal test results',
    patientName: 'Kevin',
    patientAge: 51,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Medical discussions are easier when you have support and can document information.',
    answerOptions: [
      { 
        optionText: 'Bring a family member or friend, write down questions beforehand, and bring paper to take notes', 
        isCorrect: true, 
        explanation: 'Having support helps you process information, remember details, and ask important questions.' 
      },
      { 
        optionText: 'Go alone so you can keep health information private', 
        isCorrect: false, 
        explanation: 'While privacy is important, support during difficult medical news is often beneficial.' 
      },
      { 
        optionText: 'Research the condition online extensively beforehand', 
        isCorrect: false, 
        explanation: 'Online research before knowing your actual diagnosis can cause unnecessary anxiety and misinformation.' 
      },
      { 
        optionText: 'Avoid preparing to prevent worrying too much', 
        isCorrect: false, 
        explanation: 'Preparation helps you ask better questions and understand your situation more clearly.' 
      }
    ]
  });

  // Question 8: Insurance verification scenario
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'You scheduled an appointment with a new specialist next month. When should you verify they accept your insurance?',
    patientContext: 'Patient with new specialist appointment',
    patientName: 'Michelle',
    patientAge: 38,
    difficultyLevel: 'BEGINNER',
    hintText: 'Insurance issues are easier to resolve before the appointment than after.',
    answerOptions: [
      { 
        optionText: 'Immediately after scheduling - call both the office and your insurance company', 
        isCorrect: true, 
        explanation: 'Early verification gives you time to find an in-network provider if needed and avoid surprise bills.' 
      },
      { 
        optionText: 'The day before the appointment', 
        isCorrect: false, 
        explanation: 'This is too late to find an alternative if the doctor is out-of-network.' 
      },
      { 
        optionText: 'Don\'t worry about it - just ask at check-in', 
        isCorrect: false, 
        explanation: 'By then it may be too late to change providers, and you could be responsible for the full cost.' 
      },
      { 
        optionText: 'After the appointment when you get the bill', 
        isCorrect: false, 
        explanation: 'Verifying insurance after receiving care can result in unexpected out-of-pocket costs.' 
      }
    ]
  });

  // Question 9: Virtual visit preparation
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'You have a telemedicine video appointment tomorrow for a rash. How should you prepare differently than an in-person visit?',
    patientContext: 'Patient preparing for virtual dermatology consultation',
    patientName: 'Brian',
    patientAge: 33,
    difficultyLevel: 'INTERMEDIATE',
    hintText: 'Virtual visits require technology setup and ways to show symptoms clearly.',
    answerOptions: [
      { 
        optionText: 'Test your camera and internet, ensure good lighting, and take clear photos of the rash', 
        isCorrect: true, 
        explanation: 'Technical preparation and visual documentation ensure the doctor can properly assess your condition remotely.' 
      },
      { 
        optionText: 'No special preparation - telemedicine is just like a phone call', 
        isCorrect: false, 
        explanation: 'Video visits require working technology and ways to visually show symptoms to the doctor.' 
      },
      { 
        optionText: 'Cover the rash with makeup so it looks better on camera', 
        isCorrect: false, 
        explanation: 'The doctor needs to see the rash as it actually appears for accurate diagnosis.' 
      },
      { 
        optionText: 'Do the visit from your car for better cell reception', 
        isCorrect: false, 
        explanation: 'A quiet, well-lit indoor space with stable internet is better for quality care.' 
      }
    ]
  });

  // Question 10: Emergency contact update scenario
  await createQuestion({
    category: 'Appointment Preparation',
    questionText: 'You moved to a new city 6 months ago and are visiting your doctor. What information is MOST critical to update?',
    patientContext: 'Established patient with recent life changes',
    patientName: 'Amanda',
    patientAge: 27,
    difficultyLevel: 'BEGINNER',
    hintText: 'Think about what information needs to be current in case of emergencies.',
    answerOptions: [
      { 
        optionText: 'Address, phone number, emergency contact, and current pharmacy', 
        isCorrect: true, 
        explanation: 'These updates ensure the office can reach you, send prescriptions correctly, and contact someone in emergencies.' 
      },
      { 
        optionText: 'Just your address for billing purposes', 
        isCorrect: false, 
        explanation: 'Emergency contacts and pharmacy information are equally important for your care and safety.' 
      },
      { 
        optionText: 'Nothing - update it at your next annual physical', 
        isCorrect: false, 
        explanation: 'Outdated contact information can delay critical communications about test results or emergencies.' 
      },
      { 
        optionText: 'Only update if they specifically ask', 
        isCorrect: false, 
        explanation: 'It\'s your responsibility to keep the office informed of current contact information.' 
      }
    ]
  });

  console.log('Successfully created 10 appointment preparation questions!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

