let myChart;
let k=0;

const totalDuration = 10000;
var delayBetweenPoints = totalDuration / 5000;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(1000) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index].getProps(['y'], true).y;

const animation = {
  x: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: NaN, // the point is initially skipped
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) {
        return 0;
      }
      ctx.xStarted = true;
      return ctx.index ;
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) {
        return 0;
      }
      ctx.yStarted = true;
      return ctx.index ;
    }
  }
};

const createChart = () => {

  const ctx = document.getElementById('myChart').getContext('2d');
      
  if (myChart) {
      myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      // labels: labels1,
      datasets: [{
        label: 'Vibratie Data',
        fill: false,
        showLine: true,
        spanGaps: true,
        backgroundColor: 'rgba(75, 192, 192, 0.0)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1.75,
        cubicInterpolationMode: 'monotone',
        tension: 0
        }]
    },
    options: {
      // normalized: true,
      animation,
      responsive: true,
      interaction: {
        intersect: true
        },
      scales: {
        x: {
          beginAtZero: true,
          display: true,
          title: {
            display: false
          },
          min: 0,
          max: 1000,
          type: 'linear'
        },
        y: {
          beginAtZero: true,
          display: true,
          title: {
            display: true,
            text: 'Volti'
          },
          min: 0,
          max: 3.3
        }
      },
      elements: {
        point: {
          radius: 0
        }},
    }
  });
};

function updateChart() {
    clearChart();
    k=0;
    const userId = '0Ly3ib4O9Pb8sdJy6N0IsWQXsQh2';
    var floatsList = [];
    
    // Set up a listener for real-time updates
    const readingsRef = firebase.database().ref(`UsersData/${userId}/readings`);
    readingsRef.on('value', (snapshot) => {
        
        const data = snapshot.val();
        // Initialize an empty list for floats
        
        // Iterate over the string with a step of 4 characters
        for (let i = 0; i < data.vibratie.length; i += 4) {
          // Extract the current substring of 4 characters and convert it to a float
          const floatValue = parseFloat(data.vibratie.substr(i, 4));
          
          // Add the float value to the list
          floatsList.push(floatValue);
        }

        for (let j=0; j < floatsList.length; j += 1) {
        
          myChart.data.datasets[0].data.push(floatsList[j]);
          myChart.data.labels.push(k);
          k+=1;
          if (k>1000) {
              k=1;
              clearChart();
              myChart.update();
              console.log(k);
           }
        }
        
        floatsList=[];
        myChart.update();
        
      });   
    }

const clearChart = () => {
    
    myChart.data.datasets[0].data=[];
    myChart.data.labels=[];
   
    }
    
createChart();

