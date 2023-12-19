import { useEffect, useState  } from "react";
import { Amplify, API, graphqlOperation } from "aws-amplify";
import { Button, Box, PieChart, AreaChart, BarChart } from "@cloudscape-design/components";
import MixedLineBarChart from "@cloudscape-design/components/mixed-line-bar-chart";
import { listMessageInformations } from "../../graphql/queries";


const AdminPage = ({user}) => {
  const [graph, setGraphList] = useState([]);
  const [pieChart, setPieChart] = useState([]);
  const [lastTwelveMonth, setLastTwelveMonth] = useState([]);
  const [qualifiedMonthMap, setQualifiedMonths] = useState([]);
  const [buttonsPerMonth, setButtonsPerMonth] = useState([]);
  const [mostMessagesPerMonth, setMostMessagesPerMonth] = useState([]);


  useEffect(() => {
    fetchGraphInformation();
    messageMap();
  }, []);

  const fetchGraphInformation = async () => {
    try {
      const graphData = await API.graphql(graphqlOperation(listMessageInformations));
      const graphList = graphData.data.listMessageInformations.items;
      getLastTwelveMonth(graphList);
      getButtonsPerMonth(graphList);
      setGraphList(graphList);
    } catch (error) {
      console.log(error);
    }
  }

  const messageMap = async () => {
    try {
      const graphData = await API.graphql(graphqlOperation(listMessageInformations));
      const graphList = graphData.data.listMessageInformations.items;
      const messageList = graphList.map((gr) => gr.Message);
      const messageMap = messageList.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {});
      setPieChart(messageMap);
    } catch (error) {
      console.log(error);
    }
  }

  const getLastTwelveMonth = async (graphList) => {
    // eslint-disable-next-line no-array-constructor
    var theMonths = new Array("January", "February", "March", "April", "May", "June", 
                              "July", "August", "September", "October", "November", "December");
    var now = new Date();
    const lastTwelveMonth = [];
    for (var i = 0; i > -12; i--) {
      var past = new Date(now.getFullYear(), now.getMonth() + i, 1);
      var month = theMonths[past.getMonth()];
      var year = past.getFullYear().toString();
      lastTwelveMonth.unshift(month + ' ' + year);
    }
    
    // Get intersection of last 12 months and months in our dataset
    const timeStamps = graphList.map((gr) => new Date(gr.Timestamp).toLocaleString('default', { month: 'long' }) + " " + new Date(gr.Timestamp).getFullYear());
    const qualifiedMonths = timeStamps.filter((x) => lastTwelveMonth.includes(x));
    const qualifiedMonthMap = qualifiedMonths.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});

    console.log(qualifiedMonthMap)
  
    setLastTwelveMonth(lastTwelveMonth);
    setQualifiedMonths(qualifiedMonthMap);
  }

  const getButtonsPerMonth = async (graphList) => {
    const today = new Date();
    const lastYear = today.getFullYear() - 1;
    
    const buttonsMap = {};
    
    graphList.forEach(item => {
      const date = new Date(item.Timestamp);
      
      // Only process if year is in last 12 months
      if (date.getFullYear() >= lastYear) {
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const key = `${month} ${year}`;
    
        if (!buttonsMap[key]) {
          buttonsMap[key] = []; 
        }
    
        buttonsMap[key].push(item.Message); 
      }
    });
    
    // Find most messages per months acroos all months
    const allValues = Object.values(buttonsMap);
    const flattened = allValues.flat();
    const unique = [...new Set(flattened)];

    setMostMessagesPerMonth(unique);
    setButtonsPerMonth(buttonsMap);
  }

  return (
    <div>
    <MixedLineBarChart
      series={[
        {
          title: "Buttons pressed",
          type: "bar",
          data: Object.keys(qualifiedMonthMap).map(key => 
            ({
              x: key, 
              y: qualifiedMonthMap[key]
            }))
        }
      ]}
      xDomain={
        lastTwelveMonth.map((monthYear) => monthYear)
      }
      yDomain={[0, 200]}
      i18nStrings={{
        yTickFormatter: function s(t) {
          return Math.abs(t) >= 1e9
            ? (t / 1e9).toFixed(1).replace(/\.0$/, "") +
                "G"
            : Math.abs(t) >= 1e6
            ? (t / 1e6).toFixed(1).replace(/\.0$/, "") +
              "M"
            : Math.abs(t) >= 1e3
            ? (t / 1e3).toFixed(1).replace(/\.0$/, "") +
              "K"
            : t.toFixed(0);
        }
      }}
      ariaLabel="Mixed bar chart"
      height={300}
      xScaleType="categorical"
      yTitle="Number of requests over last 12 months"
      hideFilter
      empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
      noMatch={
        <Box textAlign="center" color="inherit">
          <b>No matching data</b>
          <Box variant="p" color="inherit">
            There is no matching data to display
          </Box>
          <Button>Clear filter</Button>
        </Box>
      }
    />


      
    <BarChart
      series={Array.from({length: mostMessagesPerMonth.length}, (_, i) => ({
        title: mostMessagesPerMonth[i],
        type: 'bar',
        data: Object.values(Object.keys(buttonsPerMonth).reduce((acc, key) => {
            let count = 0;
            buttonsPerMonth[key].forEach(msg => {
              if (msg === mostMessagesPerMonth[i]) {
                count++;
              }
            });
            if (count > acc[key]?.y||!acc[key]) {
              acc[key] = {x: key, y: count};
            }
            
            return acc;
          }, {})
      ).filter(item => item.y !== 0)
    }))}
      xDomain={
        lastTwelveMonth.map((monthYear) => monthYear)
      }
      yDomain={[0, 200]}
      i18nStrings={{
        yTickFormatter: function s(t) {
          return Math.abs(t) >= 1e9
            ? (t / 1e9).toFixed(1).replace(/\.0$/, "") +
                "G"
            : Math.abs(t) >= 1e6
            ? (t / 1e6).toFixed(1).replace(/\.0$/, "") +
              "M"
            : Math.abs(t) >= 1e3
            ? (t / 1e3).toFixed(1).replace(/\.0$/, "") +
              "K"
            : t.toFixed(0);
        }
      }}
      ariaLabel="Single data series line chart"
      height={300}
      xTitle="Requests spread across months over the last 12 months"
      yTitle="Buttons pressed"
      horizontalBars
      stackedBars
      empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
      noMatch={
        <Box textAlign="center" color="inherit">
          <b>No matching data</b>
          <Box variant="p" color="inherit">
            There is no matching data to display
          </Box>
          <Button>Clear filter</Button>
        </Box>
      }
    />



    <PieChart
      data={Object.keys(pieChart).map(key => 
        ({
          title: key, 
          value: pieChart[key]
        }))}
      detailPopoverContent={(datum, sum) => [
        { key: "Count", value: datum.value },
        {
          key: "Percentage",
          value: `${((datum.value / sum) * 100).toFixed(
            0
          )}%`
        }
      ]}
      ariaDescription="Pie chart showing button pressed proportions."
      ariaLabel="Pie chart"
      size="large"
      legendTitle="Requests over all time"
      hideFilter
      hideTitles
      empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
      noMatch={
        <Box textAlign="center" color="inherit">
          <b>No matching data</b>
          <Box variant="p" color="inherit">
            There is no matching data to display
          </Box>
          <Button>Clear filter</Button>
        </Box>
      }
    />

    </div>
  );
}

export default AdminPage;