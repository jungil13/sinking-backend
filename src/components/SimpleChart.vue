<template>
  <div class="chart-container">
    <div v-if="!hasChartJS" class="fallback-chart">
      <div class="chart-placeholder">
        <div class="chart-header">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">Monthly Financial Overview</h3>
          <div class="flex items-center space-x-4 mb-6">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Contributions</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span class="text-sm text-gray-600">Loans</span>
            </div>
          </div>
        </div>
        
        <!-- Simple Bar Chart using CSS -->
        <div class="simple-chart">
          <div class="chart-bars">
            <div 
              v-for="(month, index) in (data.labels || [])" 
              :key="month"
              class="chart-bar-group"
            >
              <div class="bar-container">
                <div 
                  class="bar contributions-bar"
                  :style="{ height: getBarHeight(data.contributions[index] || 0, maxValue) + '%' }"
                  :title="`${month}: ₱${(data.contributions[index] || 0).toLocaleString()}`"
                ></div>
                <div 
                  class="bar loans-bar"
                  :style="{ height: getBarHeight(data.loans[index] || 0, maxValue) + '%' }"
                  :title="`${month}: ₱${(data.loans[index] || 0).toLocaleString()}`"
                ></div>
              </div>
              <div class="bar-label">{{ month }}</div>
            </div>
          </div>
          
          <!-- Y-axis labels -->
          <div class="y-axis">
            <div v-for="tick in yAxisTicks" :key="tick" class="y-tick">
              ₱{{ formatValue(tick) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <canvas v-else ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      contributions: [],
      loans: []
    })
  },
  type: {
    type: String,
    default: 'bar'
  },
  height: {
    type: Number,
    default: 300
  }
})

const chartCanvas = ref(null)
let chartInstance = null
let hasChartJS = ref(false)

// Check if Chart.js is available
const checkChartJS = () => {
  try {
    // Try to import Chart.js dynamically
    import('chart.js').then((ChartJS) => {
      hasChartJS.value = true
      nextTick(() => {
        createChart(ChartJS)
      })
    }).catch(() => {
      hasChartJS.value = false
    })
  } catch {
    hasChartJS.value = false
  }
}

// Computed properties for simple chart
const maxValue = computed(() => {
  const contributions = props.data.contributions || []
  const loans = props.data.loans || []
  const allValues = [...contributions, ...loans].filter(val => val != null && !isNaN(val))
  return Math.max(...allValues, 1000) // Minimum 1000 for better visualization
})

const yAxisTicks = computed(() => {
  const ticks = []
  const step = maxValue.value / 5
  for (let i = 0; i <= 5; i++) {
    ticks.push(Math.round(step * i))
  }
  return ticks
})

const getBarHeight = (value, max) => {
  if (!value || !max || isNaN(value) || isNaN(max)) return 2
  return Math.max((value / max) * 100, 2) // Minimum 2% height
}

const formatValue = (value) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

const createChart = (ChartJS) => {
  if (!hasChartJS.value || !chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  try {
    const { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } = ChartJS
    
    Chart.register(
      CategoryScale,
      LinearScale,
      BarElement,
      LineElement,
      PointElement,
      Title,
      Tooltip,
      Legend,
      Filler
    )

    const ctx = chartCanvas.value.getContext('2d')
    
    const datasets = []
    
    if (props.type === 'bar' || props.type === 'mixed') {
      datasets.push({
        label: 'Contributions',
        data: props.data.contributions,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      })
      
      datasets.push({
        label: 'Loans',
        data: props.data.loans,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      })
    }
    
    if (props.type === 'line' || props.type === 'mixed') {
      datasets.push({
        label: 'Contributions Trend',
        data: props.data.contributions,
        type: 'line',
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      })
      
      datasets.push({
        label: 'Loans Trend',
        data: props.data.loans,
        type: 'line',
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      })
    }

    chartInstance = new Chart(ctx, {
      type: props.type === 'mixed' ? 'bar' : props.type,
      data: {
        labels: props.data.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ₱${context.parsed.y.toLocaleString()}`
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11,
                weight: '500'
              },
              color: '#6B7280'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 11,
                weight: '500'
              },
              color: '#6B7280',
              callback: function(value) {
                return '₱' + value.toLocaleString()
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    })
  } catch (error) {
    console.warn('Chart.js not available, using fallback visualization')
    hasChartJS.value = false
  }
}

// Watch for data changes
watch(() => props.data, () => {
  if (hasChartJS.value) {
    nextTick(() => {
      import('chart.js').then((ChartJS) => {
        createChart(ChartJS)
      })
    })
  }
}, { deep: true })

// Watch for type changes
watch(() => props.type, () => {
  if (hasChartJS.value) {
    nextTick(() => {
      import('chart.js').then((ChartJS) => {
        createChart(ChartJS)
      })
    })
  }
})

onMounted(() => {
  checkChartJS()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

.chart-container canvas {
  max-height: 100%;
}

.fallback-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.simple-chart {
  flex: 1;
  display: flex;
  position: relative;
  padding-left: 60px;
  padding-bottom: 40px;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: end;
  justify-content: space-around;
  padding: 20px 0;
  border-bottom: 2px solid #e5e7eb;
  border-left: 2px solid #e5e7eb;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
}

.bar-container {
  display: flex;
  align-items: end;
  height: 200px;
  width: 40px;
  gap: 2px;
}

.bar {
  width: 18px;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.bar:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.contributions-bar {
  background: linear-gradient(to top, #3b82f6, #60a5fa);
}

.loans-bar {
  background: linear-gradient(to top, #10b981, #34d399);
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
}

.y-axis {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 40px;
  width: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
}

.y-tick {
  font-size: 11px;
  color: #6b7280;
  text-align: right;
  padding-right: 8px;
}

.chart-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>