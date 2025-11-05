const MissingDataStrategy = require('./strategies/missing-data.strategy');
const DuplicatesStrategy = require('./strategies/duplicates.strategy');
const OutliersStrategy = require('./strategies/outliers.strategy');
const ValidationStrategy = require('./strategies/validation.strategy');
const StandardizationStrategy = require('./strategies/standardization.strategy');
const profiler = require('./profiler.service');

class CleansingPipeline {
  constructor(config) {
    this.strategies = [];
    this.config = config;
  }

  addStrategy(strategy) {
    this.strategies.push(strategy);
    return this;
  }

  async execute(data) {
    let cleanedData = data;
    const report = {
      original: { 
        rowCount: data.length,
        columnCount: data.length > 0 ? Object.keys(data[0]).length : 0,
        profile: profiler.profile(data)
      },
      steps: [],
      final: {},
    };

    for (const strategy of this.strategies) {
      const stepResult = await strategy.apply(cleanedData, this.config);
      cleanedData = stepResult.data;
      
      report.steps.push({
        name: strategy.name,
        changes: stepResult.changes,
        timestamp: new Date().toISOString(),
      });
    }

    report.final = {
      rowCount: cleanedData.length,
      columnCount: cleanedData.length > 0 ? Object.keys(cleanedData[0]).length : 0,
      columnsRemoved: report.steps.reduce((sum, s) => 
        sum + (s.changes.columnsRemoved || 0), 0),
      rowsRemoved: report.steps.reduce((sum, s) => 
        sum + (s.changes.rowsRemoved || 0), 0),
      valuesCorrected: report.steps.reduce((sum, s) => 
        sum + (s.changes.valuesCorrected || 0), 0),
      duplicatesRemoved: report.steps.reduce((sum, s) => 
        sum + (s.changes.duplicatesFound || 0), 0),
      outliersFound: report.steps.reduce((sum, s) => 
        sum + (s.changes.outliersFound || 0), 0),
      profile: profiler.profile(cleanedData)
    };

    return { data: cleanedData, report };
  }

  static createDefaultPipeline(config) {
    const pipeline = new CleansingPipeline(config);
    
    // Add strategies in order
    pipeline.addStrategy(new StandardizationStrategy());
    pipeline.addStrategy(new ValidationStrategy());
    pipeline.addStrategy(new MissingDataStrategy());
    pipeline.addStrategy(new DuplicatesStrategy());
    pipeline.addStrategy(new OutliersStrategy());
    
    return pipeline;
  }
}

module.exports = CleansingPipeline;


