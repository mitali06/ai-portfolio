// RiskIQ Analysis Parser and Formatter
// Converts raw Claude API response into structured, professional report format

class RiskIQAnalysisFormatter {
  constructor(rawAnalysis) {
    this.rawAnalysis = rawAnalysis;
    this.parsed = this.parseAnalysis();
  }

  // Clean markdown and special characters from text
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '')           // Remove ** bold markers
      .replace(/##\s*/g, '')          // Remove ## headers
      .replace(/^--\s*/gm, '')        // Remove -- list markers
      .replace(/^- /gm, '')           // Remove standard dashes
      .replace(/^• /gm, '')           // Remove bullets
      .trim();
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
    
    // Parse list items with structured data
    const concerns = this.parseStructuredItems(concernsSection);
    const strengths = this.parseStructuredItems(positiveSection);
    const recommendations = this.parseStructuredItems(recommendationsSection);
    
    return {
      riskLevel,
      riskPercentage,
      metrics,
      concerns,
      strengths,
      recommendations,
      conclusion: this.cleanText(conclusionSection)
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
      // Match patterns like "- Label: value" or "- Label: description with numbers"
      const match = line.match(/^[-•]\s*(.+?):\s*(.+)$/);
      if (match) {
        let label = match[1].trim();
        let value = match[2].trim();
        
        // Clean markdown and special characters
        label = this.cleanText(label);
        value = this.cleanText(value);
        
        // Extract just the final result/number from complex calculations
        value = this.extractFinalResult(value);
        
        if (label && value) {
          metrics.push({
            label: label,
            value: value
          });
        }
      }
    });
    
    return metrics;
  }

  // Extract the final result from a calculation string
  extractFinalResult(text) {
    // Remove formula syntax like "x / y = z" and just keep the result part
    if (text.includes('=')) {
      const parts = text.split('=');
      return this.cleanText(parts[parts.length - 1]);
    }
    
    // Look for patterns like "Result: X" or "approximately X"
    const resultMatch = text.match(/(?:Result:|approximately|is|equals)\s*(.+?)(?:\s*\(|$)/i);
    if (resultMatch) {
      return this.cleanText(resultMatch[1]);
    }
    
    // If text is short, return as is (already cleaned)
    if (text.length < 100) {
      return text;
    }
    
    // For long text, try to extract the numeric result
    const numMatch = text.match(/(\d+\.?\d*%|\$[\d,]+\.?\d*|[\d.]+:\d+\.?\d*)/);
    if (numMatch) {
      // Return just the number with minimal context
      const beforeNum = text.substring(0, text.indexOf(numMatch[1]));
      const afterNum = text.substring(text.indexOf(numMatch[1]) + numMatch[1].length, text.indexOf(numMatch[1]) + 50);
      return (beforeNum.split(' ').slice(-2).join(' ') + ' ' + numMatch[1] + afterNum).trim();
    }
    
    // Otherwise return cleaned text
    return text;
  }

  parseStructuredItems(itemsText) {
    const items = [];
    const lines = itemsText.split('\n').filter(line => line.trim());
    
    let currentItem = null;
    
    lines.forEach(line => {
      const cleanLine = this.cleanText(line);
      
      if (!cleanLine) return;
      
      // Check if this is a numbered/bulleted main item
      const isMainItem = /^[\d]+\.|^[-•*]|^[A-Z]/.test(line);
      
      if (isMainItem && cleanLine.length > 5) {
        // Save previous item if exists
        if (currentItem && (currentItem.title || currentItem.content)) {
          items.push(currentItem);
        }
        
        // Start new item - extract title and content
        let fullText = cleanLine;
        let title = '';
        let content = '';
        
        if (fullText.includes(':')) {
          const parts = fullText.split(':');
          title = parts[0].trim();
          content = parts.slice(1).join(':').trim();
        } else {
          content = fullText;
        }
        
        currentItem = {
          title: title,
          content: content
        };
      } else if (currentItem && cleanLine.length > 0) {
        // This is a continuation of previous item
        currentItem.content = (currentItem.content ? currentItem.content + ' ' : '') + cleanLine;
      }
    });
    
    // Don't forget the last item
    if (currentItem && (currentItem.title || currentItem.content)) {
      items.push(currentItem);
    }
    
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

  getSummary() {
    return {
      riskLevel: this.parsed.riskLevel,
      riskPercentage: this.parsed.riskPercentage,
      conclusion: this.parsed.conclusion,
      topConcern: this.parsed.concerns[0]?.content || 'No concerns identified',
      topStrength: this.parsed.strengths[0]?.content || 'No strengths identified',
      topRecommendation: this.parsed.recommendations[0]?.content || 'No recommendations'
    };
  }
}

// Export for use in HTML
window.RiskIQAnalysisFormatter = RiskIQAnalysisFormatter;
