<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
} from 'chart.js'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController
)

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
    default: 'bar', // 'bar', 'line', 'mixed'
    validator: (value) => ['bar', 'line', 'mixed'].includes(value)
  },
  height: {
    type: Number,
    default: 300
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = () => {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

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
      label: props.data.loansLabel || 'Loans',
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
      label: (props.data.loansLabel || 'Loans') + ' Trend',
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
}

// Watch for data changes
watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

// Watch for type changes
watch(() => props.type, () => {
  nextTick(() => {
    createChart()
  })
})

onMounted(() => {
  nextTick(() => {
    createChart()
  })
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
</style>
