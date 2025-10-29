const Database = require('./database');

// Seed data for realistic B2B pilot programs
async function seed() {
  const db = new Database('./pilots.db');

  try {
    console.log('Initializing database...');
    await db.initialize();

    console.log('Seeding pilot programs...');

    // Pilot 1: Acme Financial - High performing FinTech pilot
    const pilot1 = await db.createPilot({
      company_name: 'Acme Financial Services',
      industry: 'FinTech',
      start_date: '2025-08-01',
      end_date: '2025-10-30',
      status: 'Active',
      health_score: 85,
      contract_value: 500000,
      arr_projection: 1200000,
      conversion_probability: 85,
      primary_contact: 'Sarah Chen - VP of Engineering',
      notes: 'Strong engagement from engineering team. CEO personally invested in success.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot1.id,
      criteria: 'Process 10,000+ transactions without errors',
      target_value: '10000',
      current_value: '8543',
      status: 'In Progress',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot1.id,
      criteria: 'Reduce processing time by 40%',
      target_value: '40%',
      current_value: '38%',
      status: 'In Progress',
      weight: 4
    });

    await db.createSuccessCriteria({
      pilot_id: pilot1.id,
      criteria: 'Integration with existing systems',
      target_value: 'Complete',
      current_value: 'Complete',
      status: 'Achieved',
      weight: 5
    });

    await db.createStakeholder({
      pilot_id: pilot1.id,
      name: 'Sarah Chen',
      role: 'VP of Engineering',
      email: 'schen@acmefinancial.com',
      engagement_level: 'High',
      last_contact: '2025-10-27'
    });

    await db.createStakeholder({
      pilot_id: pilot1.id,
      name: 'Michael Roberts',
      role: 'CEO',
      email: 'mroberts@acmefinancial.com',
      engagement_level: 'High',
      last_contact: '2025-10-25'
    });

    // Add metrics for Acme Financial
    const acmeMetrics = [
      { metric_name: 'Daily Active Users', metric_value: '125', metric_type: 'usage' },
      { metric_name: 'Transaction Volume', metric_value: '8543', metric_type: 'usage' },
      { metric_name: 'User Satisfaction', metric_value: '4.6', metric_type: 'satisfaction' },
      { metric_name: 'API Response Time', metric_value: '145ms', metric_type: 'performance' },
      { metric_name: 'Feature Adoption Rate', metric_value: '78%', metric_type: 'adoption' }
    ];

    for (const metric of acmeMetrics) {
      await db.createMetric({ pilot_id: pilot1.id, ...metric });
    }

    // Pilot 2: MedTech Solutions - At Risk HealthTech pilot
    const pilot2 = await db.createPilot({
      company_name: 'MedTech Solutions',
      industry: 'HealthTech',
      start_date: '2025-09-01',
      end_date: '2025-10-30',
      status: 'At Risk',
      health_score: 42,
      contract_value: 1200000,
      arr_projection: 3000000,
      conversion_probability: 35,
      primary_contact: 'Dr. James Wilson - CTO',
      notes: 'Integration challenges with legacy EMR system. Compliance concerns raised.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot2.id,
      criteria: 'HIPAA compliance certification',
      target_value: 'Certified',
      current_value: 'In Review',
      status: 'At Risk',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot2.id,
      criteria: 'EMR integration complete',
      target_value: 'Complete',
      current_value: '60%',
      status: 'At Risk',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot2.id,
      criteria: 'User training completion',
      target_value: '100 users',
      current_value: '45 users',
      status: 'In Progress',
      weight: 3
    });

    await db.createStakeholder({
      pilot_id: pilot2.id,
      name: 'Dr. James Wilson',
      role: 'CTO',
      email: 'jwilson@medtechsolutions.com',
      engagement_level: 'Medium',
      last_contact: '2025-10-20'
    });

    await db.createStakeholder({
      pilot_id: pilot2.id,
      name: 'Lisa Martinez',
      role: 'Compliance Officer',
      email: 'lmartinez@medtechsolutions.com',
      engagement_level: 'Low',
      last_contact: '2025-10-10'
    });

    // Pilot 3: Enterprise Corp - Successful SaaS pilot, converted
    const pilot3 = await db.createPilot({
      company_name: 'Enterprise Corp',
      industry: 'SaaS Platform',
      start_date: '2025-07-01',
      end_date: '2025-09-28',
      status: 'Converted',
      health_score: 95,
      contract_value: 2000000,
      arr_projection: 5000000,
      conversion_probability: 100,
      primary_contact: 'Amanda Foster - Chief Product Officer',
      notes: 'Exceptional results. Exceeded all success criteria. Contract signed for 3 years.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot3.id,
      criteria: 'Reduce operational costs by 30%',
      target_value: '30%',
      current_value: '42%',
      status: 'Achieved',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot3.id,
      criteria: 'Deploy to 500+ users',
      target_value: '500',
      current_value: '627',
      status: 'Achieved',
      weight: 4
    });

    await db.createStakeholder({
      pilot_id: pilot3.id,
      name: 'Amanda Foster',
      role: 'Chief Product Officer',
      email: 'afoster@enterprisecorp.com',
      engagement_level: 'High',
      last_contact: '2025-09-28'
    });

    // Pilot 4: CloudScale Technologies - DevOps platform, on track
    const pilot4 = await db.createPilot({
      company_name: 'CloudScale Technologies',
      industry: 'DevOps',
      start_date: '2025-09-15',
      end_date: '2025-12-15',
      status: 'Active',
      health_score: 78,
      contract_value: 750000,
      arr_projection: 1800000,
      conversion_probability: 75,
      primary_contact: 'Raj Patel - Engineering Director',
      notes: 'Strong technical fit. Team loves the product. Budget approval needed from CFO.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot4.id,
      criteria: 'Deploy 50 microservices',
      target_value: '50',
      current_value: '38',
      status: 'In Progress',
      weight: 4
    });

    await db.createSuccessCriteria({
      pilot_id: pilot4.id,
      criteria: 'Reduce deployment time by 60%',
      target_value: '60%',
      current_value: '55%',
      status: 'In Progress',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot4.id,
      criteria: 'Zero downtime during migration',
      target_value: '99.9%',
      current_value: '99.95%',
      status: 'Achieved',
      weight: 5
    });

    await db.createStakeholder({
      pilot_id: pilot4.id,
      name: 'Raj Patel',
      role: 'Engineering Director',
      email: 'rpatel@cloudscale.io',
      engagement_level: 'High',
      last_contact: '2025-10-26'
    });

    // Pilot 5: DataStream Analytics - Data platform, early stage
    const pilot5 = await db.createPilot({
      company_name: 'DataStream Analytics',
      industry: 'Data & Analytics',
      start_date: '2025-10-01',
      end_date: '2025-12-31',
      status: 'Active',
      health_score: 65,
      contract_value: 850000,
      arr_projection: 2200000,
      conversion_probability: 60,
      primary_contact: 'Emily Zhang - Head of Data Science',
      notes: 'Early stage but promising. Need to demonstrate ROI on specific use cases.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot5.id,
      criteria: 'Process 1TB+ of data daily',
      target_value: '1TB',
      current_value: '0.4TB',
      status: 'In Progress',
      weight: 4
    });

    await db.createSuccessCriteria({
      pilot_id: pilot5.id,
      criteria: 'Build 5 ML models',
      target_value: '5',
      current_value: '2',
      status: 'In Progress',
      weight: 4
    });

    await db.createStakeholder({
      pilot_id: pilot5.id,
      name: 'Emily Zhang',
      role: 'Head of Data Science',
      email: 'ezhang@datastream.io',
      engagement_level: 'High',
      last_contact: '2025-10-28'
    });

    // Pilot 6: SecureAuth Inc - Security platform, critical risk
    const pilot6 = await db.createPilot({
      company_name: 'SecureAuth Inc',
      industry: 'Cybersecurity',
      start_date: '2025-08-15',
      end_date: '2025-10-15',
      status: 'At Risk',
      health_score: 28,
      contract_value: 950000,
      arr_projection: 2500000,
      conversion_probability: 25,
      primary_contact: 'Marcus Johnson - CISO',
      notes: 'Pilot extended by 2 weeks. Performance issues discovered. Escalated to CEO.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot6.id,
      criteria: 'Block 99.9% of threats',
      target_value: '99.9%',
      current_value: '97.2%',
      status: 'At Risk',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot6.id,
      criteria: 'False positive rate < 1%',
      target_value: '1%',
      current_value: '3.2%',
      status: 'Failed',
      weight: 5
    });

    await db.createStakeholder({
      pilot_id: pilot6.id,
      name: 'Marcus Johnson',
      role: 'CISO',
      email: 'mjohnson@secureauth.com',
      engagement_level: 'Unresponsive',
      last_contact: '2025-10-05'
    });

    // Pilot 7: RetailConnect - E-commerce platform, strong
    const pilot7 = await db.createPilot({
      company_name: 'RetailConnect',
      industry: 'E-commerce',
      start_date: '2025-09-01',
      end_date: '2025-11-30',
      status: 'Active',
      health_score: 88,
      contract_value: 650000,
      arr_projection: 1500000,
      conversion_probability: 85,
      primary_contact: 'David Kim - VP of Technology',
      notes: 'Excellent product-market fit. Sales increase of 23% during pilot.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot7.id,
      criteria: 'Increase conversion rate by 15%',
      target_value: '15%',
      current_value: '18%',
      status: 'Achieved',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot7.id,
      criteria: 'Page load time < 2 seconds',
      target_value: '2s',
      current_value: '1.4s',
      status: 'Achieved',
      weight: 4
    });

    await db.createSuccessCriteria({
      pilot_id: pilot7.id,
      criteria: 'Handle Black Friday traffic',
      target_value: 'Success',
      current_value: 'Pending',
      status: 'In Progress',
      weight: 5
    });

    await db.createStakeholder({
      pilot_id: pilot7.id,
      name: 'David Kim',
      role: 'VP of Technology',
      email: 'dkim@retailconnect.com',
      engagement_level: 'High',
      last_contact: '2025-10-28'
    });

    // Pilot 8: FinanceFlow - Accounting software, moderate
    const pilot8 = await db.createPilot({
      company_name: 'FinanceFlow Solutions',
      industry: 'FinTech',
      start_date: '2025-08-20',
      end_date: '2025-11-20',
      status: 'Active',
      health_score: 70,
      contract_value: 480000,
      arr_projection: 1100000,
      conversion_probability: 65,
      primary_contact: 'Catherine Moore - CFO',
      notes: 'Integration with QuickBooks taking longer than expected. Otherwise positive.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot8.id,
      criteria: 'QuickBooks integration',
      target_value: 'Complete',
      current_value: '75%',
      status: 'In Progress',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot8.id,
      criteria: 'Automate 80% of invoicing',
      target_value: '80%',
      current_value: '72%',
      status: 'In Progress',
      weight: 4
    });

    await db.createStakeholder({
      pilot_id: pilot8.id,
      name: 'Catherine Moore',
      role: 'CFO',
      email: 'cmoore@financeflow.com',
      engagement_level: 'Medium',
      last_contact: '2025-10-24'
    });

    // Pilot 9: TechCorp Industries - Manufacturing IoT, completed
    const pilot9 = await db.createPilot({
      company_name: 'TechCorp Industries',
      industry: 'Manufacturing IoT',
      start_date: '2025-06-01',
      end_date: '2025-09-01',
      status: 'Completed',
      health_score: 82,
      contract_value: 1500000,
      arr_projection: 3500000,
      conversion_probability: 80,
      primary_contact: 'Robert Chen - COO',
      notes: 'Pilot completed successfully. In contract negotiation phase.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot9.id,
      criteria: 'Reduce downtime by 40%',
      target_value: '40%',
      current_value: '45%',
      status: 'Achieved',
      weight: 5
    });

    await db.createSuccessCriteria({
      pilot_id: pilot9.id,
      criteria: 'Monitor 200+ sensors',
      target_value: '200',
      current_value: '234',
      status: 'Achieved',
      weight: 4
    });

    await db.createStakeholder({
      pilot_id: pilot9.id,
      name: 'Robert Chen',
      role: 'COO',
      email: 'rchen@techcorp.com',
      engagement_level: 'High',
      last_contact: '2025-09-15'
    });

    // Pilot 10: GlobalComms - Communication platform, lost
    const pilot10 = await db.createPilot({
      company_name: 'GlobalComms',
      industry: 'Unified Communications',
      start_date: '2025-07-01',
      end_date: '2025-09-30',
      status: 'Lost',
      health_score: 15,
      contract_value: 720000,
      arr_projection: 0,
      conversion_probability: 0,
      primary_contact: 'Jennifer Adams - VP of IT',
      notes: 'Lost to competitor. Price and feature set were not competitive.'
    });

    await db.createSuccessCriteria({
      pilot_id: pilot10.id,
      criteria: 'Replace legacy phone system',
      target_value: 'Complete',
      current_value: 'Failed',
      status: 'Failed',
      weight: 5
    });

    await db.createStakeholder({
      pilot_id: pilot10.id,
      name: 'Jennifer Adams',
      role: 'VP of IT',
      email: 'jadams@globalcomms.com',
      engagement_level: 'Unresponsive',
      last_contact: '2025-09-15'
    });

    console.log('');
    console.log('='.repeat(60));
    console.log('  Database seeded successfully!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Created 10 pilot programs:');
    console.log('  - 5 Active pilots');
    console.log('  - 2 At Risk pilots');
    console.log('  - 1 Converted pilot');
    console.log('  - 1 Completed pilot');
    console.log('  - 1 Lost pilot');
    console.log('');
    console.log('Industries covered:');
    console.log('  FinTech, HealthTech, SaaS, DevOps, Data & Analytics,');
    console.log('  Cybersecurity, E-commerce, Manufacturing IoT, Communications');
    console.log('');
    console.log('Total ARR Projection: $21.8M');
    console.log('');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await db.close();
    console.log('Database connection closed');
  }
}

// Run seed function
seed()
  .then(() => {
    console.log('Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
