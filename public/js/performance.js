// Performance monitoring and error tracking
const performanceMonitor = {
  init() {
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.trackMetric('page_load_time', loadTime);
    });

    // Track scenario load times
    this.trackScenarioPerformance();
  },

  trackMetric(name, value) {
    // In production, send to analytics service
    console.log(`Metric: ${name} = ${value}ms`);
  },

  trackScenarioPerformance() {
    const originalSelectScenario = window.selectScenario;
    window.selectScenario = (scenarioId) => {
      const startTime = performance.now();
      originalSelectScenario(scenarioId);
      const endTime = performance.now();
      this.trackMetric('scenario_load_time', endTime - startTime);
    };
  }
};

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}
