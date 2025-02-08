import { smtpDiagnostics } from '../utils/smtpDiagnostics';

async function runSmtpDiagnostics() {
  console.log('🔍 Starting SMTP Diagnostic Test...');
  
  try {
    const diagnosticResult = await smtpDiagnostics.performComprehensiveSMTPTest();
    
    console.log('📋 SMTP Diagnostic Results:');
    console.log('Connection Status:', diagnosticResult.connectionStatus ? '✅ Successful' : '❌ Failed');
    
    console.log('\n🔬 Configuration Details:');
    console.log(JSON.stringify(diagnosticResult.configurationDetails, null, 2));
    
    if (!diagnosticResult.connectionStatus) {
      console.error('🚨 Error Details:', diagnosticResult.errorDetails);
    }
  } catch (error) {
    console.error('🔥 Unexpected Error during SMTP Diagnostics:', error);
  }
}

runSmtpDiagnostics();
