import { runRiskDetection } from './ai/riskDetectionAgent';

async function testWalletAnalysis() {
  console.log('🧪 Testing Wallet Analysis Integration...\n');

  const testQueries = [
    'Is wallet 0x604271D00E99EB218b29AA24714d05cec83984a6 safe?',
    'Analyze the risk of this address: 0x604271D00E99EB218b29AA24714d05cec83984a6',
    'Check if this wallet is dangerous: 0x604271D00E99EB218b29AA24714d05cec83984a6',
  ];

  for (const query of testQueries) {
    console.log(`🔍 Testing Query: "${query}"`);
    console.log('─'.repeat(50));
    
    try {
      const result = await runRiskDetection(query);
      
      if (result.error) {
        console.log('❌ Error:', result.error);
      } else {
        console.log('✅ Analysis Type:', result.analysisType);
        console.log('🎯 Entities:', result.entities);
        console.log('🛠️ Tools Used:', result.requiredTools);
        console.log('📊 Tool Results:', JSON.stringify(result.toolResults, null, 2));
        console.log('🚨 Risk Analysis:', result.riskAnalysis);
      }
    } catch (error) {
      console.log('❌ Test failed:', error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testWalletAnalysis().catch(console.error);
}

export { testWalletAnalysis };
