type TestCase = {
    description: string;
    fn: () => void | Promise<void>;
  };
  
  type TestSuite = {
    description: string;
    tests: TestCase[];
  };
  
  export class TestRunner {
    private suites: TestSuite[] = [];
    
    describe(description: string, fn: () => void) {
      const currentSuite: TestSuite = {
        description,
        tests: []
      };
      
      this.suites.push(currentSuite);
      fn();
    }
  
    it(description: string, fn: () => void | Promise<void>) {
      if (this.suites.length === 0) {
        throw new Error('Test case must be defined within a suite');
      }
      
      const currentSuite = this.suites[this.suites.length - 1];
      currentSuite.tests.push({ description, fn });
    }
  
    async run() {
      console.log('Starting tests...\n');
      
      for (const suite of this.suites) {
        console.log(`Suite: ${suite.description}`);
        
        for (const test of suite.tests) {
          try {
            await test.fn();
            console.log(`  ✓ ${test.description}`);
          } catch (error) {
            console.log(`  ✗ ${test.description}`);
            console.error(`    ${error}`);
          }
        }
        console.log('');
      }
    }
  }
