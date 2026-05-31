// RiskIQ Analysis Parser and Formatter
// Converts raw Claude API response into structured, professional report data

class RiskIQAnalysisFormatter {
  constructor(rawAnalysis) {
    this.rawAnalysis = rawAnalysis;
    this.parsed = this.parseAnalysis();
  }

  parseAnalysis() {
    const analysis = this.rawAnalysis;
    
    // Extract risk level and percentage
    const riskLevelMatch = analysis.match(/RISK LEVEL:\s*(\w+)/i);
    const riskPercentageMatch = analysis.match(/RISK PERCENTAGE:\s*(\d+)/i);
    
    const riskLevel = riskLevelMatch ? riskLevelMatch[1].toUpperCase() : 'UNKNOWN';
    const riskPercentage = riskPercentageMatch ? parseInt(riskPercentageMatch[1]) : 50;
    
    // Extract sections
    const metricsSection = this.extractSection(analysis, 'KEY METRICS', 'PRIMARY CONCERNS');
    const concernsSection = this.extractSection(analysis, 'PRIMARY CONCERNS', 'POSITIVE FACTORS');
    const positiveSection = this.extractSection(analysis, 'POSITIVE FACTORS', 'RECOMMENDATIONS');
    const recommendationsSection = this.extractSection(analysis, 'RECOMMENDATIONS', 'CONCLUSION');
    const conclusionSection = this.extractSection(analysis, 'CONCLUSION', null);
    
    // Parse metrics into key-value pairs
    const metrics = this.parseMetrics(metricsSection);
    
    // Parse list items
    const concerns = this.parseListItems(concernsSection);
    const strengths = this.parseListItems(positiveSection);
    const recommendations = this.parseListItems(recommendationsSection);
    
    return {
      riskLevel,
      riskPercentage,
      metrics,
      concerns,
      strengths,
      recommendations,
      conclusion: conclusionSection.trim()
    };
  }

  extractSection(text, startMarker, endMarker) {
    const startRegex = new RegExp(startMarker + ':', 'i');
    const startIndex = text.search(startRegex);
    
    if (startIndex === -1) return '';
    
    let endIndex = text.length;
    if (endMarker) {
      const endRegex = new RegExp(endMarker + ':', 'i');
      const found = text.substring(startIndex).search(endRegex);
      if (found !== -1) {
        endIndex = startIndex + found;
      }
    }
    
    return text.substring(startIndex + startMarker.length + 1, endIndex);
  }

  parseMetrics(metricsText) {
    const metrics = [];
    const lines = metricsText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      const match = line.match(/^[-•]\s*(.+?):\s*(.+)$/);
      if (match) {
        metrics.push({
          label: match[1].trim(),
          value: match[2].trim()
        });
      }
    });
    
    return metrics;
  }

  parseListItems(listText) {
    const items = [];
    const lines = listText.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      // Remove bullet points and numbering
      const cleanLine = line.replace(/^[-•*\d+.]\s*/, '').trim();
      if (cleanLine) {
        items.push(cleanLine);
      }
    });
    
    return items;
  }

  getFormattedReport() {
    return this.parsed;
  }

  getRiskClass() {
    const percentage = this.parsed.riskPercentage;
    if (percentage < 40) return 'low';
    if (percentage > 65) return 'high';
    return 'medium';
  }

  getRiskColor() {
    const riskClass = this.getRiskClass();
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };
    return colors[riskClass];
  }

  getDetailedMetrics() {
    // Organize metrics into categories
    const categories = {
      'Financial Ratios': [],
      'Payment Information': [],
      'Safety & Cushion': [],
      'Other': []
    };

    this.parsed.metrics.forEach(metric => {
      const label = metric.label.toLowerCase();
      
      if (label.includes('ratio') || label.includes('income')) {
        categories['Financial Ratios'].push(metric);
      } else if (label.includes('payment') || label.includes('debt')) {
        categories['Payment Information'].push(metric);
      } else if (label.includes('cushion') || label.includes('savings')) {
        categories['Safety & Cushion'].push(metric);
      } else {
        categories['Other'].push(metric);
      }
    });

    return categories;
  }

  getSummary() {
    return {
      riskLevel: this.parsed.riskLevel,
      riskPercentage: this.parsed.riskPercentage,
      conclusion: this.parsed.conclusion,
      topConcern: this.parsed.concerns[0] || 'No concerns identified',
      topStrength: this.parsed.strengths[0] || 'No strengths identified',
      topRecommendation: this.parsed.recommendations[0] || 'No recommendations'
    };
  }
}

// Export for use in HTML
window.RiskIQAnalysisFormatter = RiskIQAnalysisFormatter;
