import { useState, useEffect } from 'react';
import * as d3 from "d3";

function Select(props) {
  const { axisData, setHorizontal, setVertical, horizontalAxis, verticalAxis } = props;

  const handleChangeAxis = (event) => {
    if (event.target.name === "horizontal") {
      setHorizontal(event.target.value);
    } else if (event.target.name === "vertical") {
      setVertical(event.target.value);
    }
  }

  return <div>
    <h2>Horizontal Axis</h2>
    <select name="horizontal" defaultValue={horizontalAxis} onChange={handleChangeAxis}>
      {axisData &&
        axisData.map((item, i) => <option key={i}>{item}</option>)
      }
    </select>
    <h2>Vertical Axis</h2>
    <select name="vertical" defaultValue={verticalAxis} onChange={handleChangeAxis}>
      {axisData &&
        axisData.map((item, i) => <option key={i}>{item}</option>)
      }
    </select>
  </div>
}

function Axis(props) {
  const { xScale, yScale, horizontalAxis, verticalAxis, w, h, margin } = props;

  return <g>
    <g transform={`translate(${margin},${h - margin})`} stroke="gray">
      <line x1={w - margin * 2}></line>
      <line y1={-(h - margin * 2)}></line>
    </g>
    <g textAnchor='middle'>
      <text x={w / 2} y={h - margin / 2}>{horizontalAxis}</text>
      <text x={margin / 2} y={h / 2} transform="rotate(270,50,300)">{verticalAxis}</text>
    </g>
    {
      xScale.ticks().map((item, i) => {
        return <g transform={`translate(${xScale(item) + margin},${h - margin})`} key={i}>
          <line y1="5" stroke="black"></line>
          <text y="5" textAnchor="middle" dominantBaseline="text-before-edge">{item}</text>
        </g>
      })
    }
    {
      yScale.ticks().map((item, i) => {
        return <g transform={`translate(${margin},${(h - margin) - yScale(item)})`} key={i}>
          <line x1="-5" stroke="black"></line>
          <text x="-5" textAnchor="end" dominantBaseline="central">{item}</text>
        </g>
      })
    }
  </g>
}

function Legend(props) {
  const { species, setSpecies, w, margin } = props;

  const changeFlag = (index) => {
    setSpecies(species.map((item, j) => {
      return {
        name: item.name,
        color: item.color,
        flag: index === j ? !item.flag : item.flag,
      }
    })
    )
  }

  return <g>
    {
      species.map((item, i) => {
        return <g transform={`translate(${w - margin},${i * 30 + margin})`} key={i}>
          <rect x="0" y="0" width="10" height="10" fill={item.color}></rect>
          <text x="15" dominantBaseline="central" onClick={() => changeFlag(i)}
            style={{ cursor: "pointer" }}>{item.name}</text>
        </g>
      })
    }
  </g>
}

function ScatterPlot(props) {
  const { data, axisData, w, h, margin } = props;
  const [horizontalAxis, setHorizontal] = useState(axisData[0]);
  const [verticalAxis, setVertical] = useState(axisData[1]);
  const [species, setSpecies] = useState([]);
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, item => item[horizontalAxis]))
    .range([0, w - margin * 2])
    .nice();
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, item => item[verticalAxis]))
    .range([0, h - margin * 2])
    .nice();


  useEffect(() => {
    const array = Array.from(new Set(data.map(item => item.species)));
    setSpecies(array.map((item) => {
      return {
        name: item,
        color: color(item),
        flag: true,
      }
    }))
  }, [data]);

  return <div>
    <div>
      <h1>Scatter Plot of Iris Flower Dataset</h1>

      <Select
        axisData={axisData}
        horizontalAxis={horizontalAxis}
        verticalAxis={verticalAxis}
        setHorizontal={setHorizontal}
        setVertical={setVertical}
      />
    </div>
    <div>
      <svg width={w} height={h}>
        <Axis
          xScale={xScale}
          yScale={yScale}
          horizontalAxis={horizontalAxis}
          verticalAxis={verticalAxis}
          w={w}
          h={h}
          margin={margin}
        />
        <Legend
          species={species}
          setSpecies={setSpecies}
          w={w}
          margin={margin}
        />
        <g transform='translate(100,500) scale(1,-1)'>
          {data.map((item, i) => {
            const index = species.findIndex((value) => value.name === item.species);
            if (index !== -1 && species[index].flag) {
              return (
                <circle
                  cx={xScale(item[horizontalAxis])}
                  cy={yScale(item[verticalAxis])}
                  fill={species[index].color}
                  r="5"
                  /* style={{ transitionDuration: "500ms" }} */
                  style={{
                    transitionProperty: "cx, cy",
                    transitionDuration: "500ms"
                  }}
                  key={i}
                />
              );
            }
            return null;
          })}
        </g>
      </svg>
    </div>

  </div>
}

export default function App() {
  const url = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2004014/iris.json";
  const [data, setData] = useState([]);
  const axisData = ["sepalLength", "sepalWidth", "petalLength", "petalWidth"];
  const w = 600, h = 600, margin = 100;

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(res => setData(res))
  }, []);

  return <div>
    <ScatterPlot
      data={data}
      axisData={axisData}
      w={w}
      h={h}
      margin={margin}
    />
  </div>
}