// Script to audit the Prisma schema and document all models, fields, and relationships
import PrismaClient from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function auditSchema() {
  console.log('Starting Prisma schema audit...');
  
  try {
    // Get all available models from the Prisma client
    const prismaKeys = Object.keys(prisma);
    const modelNames = prismaKeys.filter(key => !key.startsWith('$') && typeof prisma[key] === 'object');
    
    console.log(`Found ${modelNames.length} models in the Prisma client`);
    
    // Create an audit report object
    const auditReport = {
      timestamp: new Date().toISOString(),
      totalModels: modelNames.length,
      models: {}
    };
    
    // Analyze each model
    for (const modelName of modelNames) {
      console.log(`Analyzing model: ${modelName}`);
      
      try {
        // Get the model's metadata if available
        const modelMetadata = prisma._runtimeDataModel?.models?.[modelName];
        
        // Create a model report
        auditReport.models[modelName] = {
          fields: modelMetadata?.fields?.map(field => ({
            name: field.name,
            type: field.type,
            isRequired: !field.isNullable,
            isList: field.isList,
            isId: field.isId,
            isUnique: field.isUnique,
            hasDefaultValue: field.hasDefaultValue,
            relationName: field.relationName,
            relationToFields: field.relationToFields,
            relationFromFields: field.relationFromFields
          })) || [],
          // Try to get a sample record to understand the actual structure
          sampleRecord: null
        };
        
        // Try to get a sample record
        try {
          const sampleRecord = await prisma[modelName].findFirst();
          if (sampleRecord) {
            auditReport.models[modelName].sampleRecord = sampleRecord;
          }
        } catch (error) {
          console.warn(`Could not get sample record for ${modelName}: ${error.message}`);
        }
      } catch (error) {
        console.error(`Error analyzing model ${modelName}:`, error);
        auditReport.models[modelName] = { error: error.message };
      }
    }
    
    // Save the audit report to a file
    const reportPath = path.join(process.cwd(), 'schema-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
    
    console.log(`Schema audit complete. Report saved to ${reportPath}`);
    
    // Generate a markdown summary
    const markdownPath = path.join(process.cwd(), 'schema-audit-summary.md');
    const markdown = generateMarkdownSummary(auditReport);
    fs.writeFileSync(markdownPath, markdown);
    
    console.log(`Markdown summary saved to ${markdownPath}`);
    
    return auditReport;
  } catch (error) {
    console.error('Error during schema audit:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateMarkdownSummary(auditReport) {
  let markdown = `# Prisma Schema Audit Summary\n\n`;
  markdown += `**Generated:** ${new Date(auditReport.timestamp).toLocaleString()}\n\n`;
  markdown += `**Total Models:** ${auditReport.totalModels}\n\n`;
  
  markdown += `## Models Overview\n\n`;
  markdown += `| Model | Fields | Has Sample Data |\n`;
  markdown += `| ----- | ------ | --------------- |\n`;
  
  for (const [modelName, modelData] of Object.entries(auditReport.models)) {
    const fieldCount = modelData.fields?.length || 0;
    const hasSample = modelData.sampleRecord ? '✅' : '❌';
    markdown += `| ${modelName} | ${fieldCount} | ${hasSample} |\n`;
  }
  
  markdown += `\n## Detailed Model Information\n\n`;
  
  for (const [modelName, modelData] of Object.entries(auditReport.models)) {
    markdown += `### ${modelName}\n\n`;
    
    if (modelData.error) {
      markdown += `**Error:** ${modelData.error}\n\n`;
      continue;
    }
    
    if (modelData.fields && modelData.fields.length > 0) {
      markdown += `#### Fields\n\n`;
      markdown += `| Field | Type | Required | List | ID | Unique | Default | Relation |\n`;
      markdown += `| ----- | ---- | -------- | ---- | -- | ------ | ------- | -------- |\n`;
      
      for (const field of modelData.fields) {
        markdown += `| ${field.name} | ${field.type} | ${field.isRequired ? '✅' : '❌'} | ${field.isList ? '✅' : '❌'} | ${field.isId ? '✅' : '❌'} | ${field.isUnique ? '✅' : '❌'} | ${field.hasDefaultValue ? '✅' : '❌'} | ${field.relationName || '-'} |\n`;
      }
      
      markdown += `\n`;
    }
    
    if (modelData.sampleRecord) {
      markdown += `#### Sample Record\n\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(modelData.sampleRecord, null, 2);
      markdown += '\n```\n\n';
    }
  }
  
  markdown += `## Next Steps\n\n`;
  markdown += `1. Review all models and their fields\n`;
  markdown += `2. Identify any missing or incorrect fields in the API routes\n`;
  markdown += `3. Update API routes to match the schema\n`;
  markdown += `4. Implement validation for all required fields\n`;
  markdown += `5. Add tests to ensure API-schema alignment\n`;
  
  return markdown;
}

// Run the audit
auditSchema()
  .catch(error => {
    console.error('Audit script failed:', error);
    process.exit(1);
  }); 