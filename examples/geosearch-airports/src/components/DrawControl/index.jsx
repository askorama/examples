import { TerraDraw, TerraDrawMapboxGLAdapter, TerraDrawPolygonMode, TerraDrawSelectMode } from 'terra-draw'
import { useMap } from 'react-map-gl';
import { useState, useMemo, useEffect } from 'react'

export function DrawControl(props) {

  const { current: map } = useMap();

  const [mode, setMode] = useState('static')
  const [draw, setDraw] = useState()

  const onChangeCallback = (ids, event) => {
    const snapshot = draw.getSnapshot().filter((feature) => feature.geometry.type === 'Polygon')
    const polygon = snapshot.find((polygon) => polygon.id === ids[0])

    if (event === 'create' && polygon) {
      props.onCreate(polygon)
    }
    if (event === 'update' && polygon) {
      props.onUpdate(polygon)
    }
    if (event === 'delete') {
      props.onDelete(ids)
    }
  }

  useEffect(() => {
    if (!map || draw) {
      return
    }

    const drawInstance = new TerraDraw({
      adapter: new TerraDrawMapboxGLAdapter({
        map: map.getMap(),
        minPixelDragDistanceSelecting: 1
      }),
      modes: [new TerraDrawPolygonMode({
        styles: {
          fillColor: '#f6cd63',
          outlineColor: '#faa38f',
          outlineWidth: 3,
          fillOpacity: 0.2,
          closingPointWidth: 5,
          closingPointColor: '#faa38f',
          closingPointOutlineWidth: 2,
          closingPointOutlineColor: '#f5f5f5',
        }
      }), new TerraDrawSelectMode({
        flags: {
          polygon: {
            feature: {
              draggable: true,
              rotateable: true,
              scaleable: true,
              coordinates: {
                midpoints: true,
                draggable: true,
                deletable: true,
              },
            },
          }
        },
        styles: {
          selectedPolygonColor: '#f6cd63',
          selectedPolygonOutlineColor: '#faa38f',
          outlineWidth: 3,
          selectionPolygonFillOpacity: 0.2,
          selectionPointWidth: 5,
          selectionPointColor: '#faa38f',
          selectionPointOutlineWidth: 2,
          selectionPointOutlineColor: '#f5f5f5',
          midPointColor: '#f6cd63',
          midPointOutlineColor: '#f5f5f5',
          midPointWidth: 3,
          midPointOutlineWidth: 2
        }
      })]
    })

    drawInstance.start()
    drawInstance.setMode('polygon')
    setMode('polygon')
    setDraw(drawInstance)

    // Ensure clear up on dismount
    return () => {
      drawInstance.stop()
    }
  }, [map])


  useEffect(() => {
    const callback = (ids, event) => {
      onChangeCallback(ids, event)
    }

    if (draw) {
      draw.on('change', callback)
    }

    // Ensure callbacks are deleted and created correcltly
    return () => {
      if (draw && callback) {
        draw.off('change', callback)
      }
    }

  }, [draw, onChangeCallback])

  return <>
    <div>
      <button
        id="draw-select"
        title="Draw Polygon"
        disabled={!draw}
        onClick={() => {
          if (draw) {
            draw.setMode('polygon');
            setMode('polygon');
          }
        }}
        style={{
          background: "#f5f5f5",
          top: "30px",
          right: "30px",
          zIndex: 1,
          height: "30px",
          width: "30px",
          position: "absolute",
          borderRadius: "2px",
          outline: mode === 'polygon' ? "solid 3px #f6cd63" : 'none'
        }}>
        <img
          style={{
            height: "90%",
            margin: "auto",
            padding: "5px"
          }}
          src="./edit-pen-icon.webp" />

      </button>

      <button
        id="draw-select"
        title="Select Polygon"
        disabled={!draw}

        onClick={() => {
          if (draw) {
            draw.setMode('select');
            setMode('select');
          }
        }}
        style={{
          background: "#f5f5f5",
          top: "70px",
          right: "30px",
          zIndex: 1,
          height: "30px",
          width: "30px",
          position: "absolute",
          borderRadius: "2px",
          outline: mode === 'select' ? "solid 3px #f6cd63" : 'none'
        }}>
        <img
          style={{
            height: "100%",
            margin: "auto",
            padding: "5px"
          }}
          src="./hand-finger-click-icon.webp" />
      </button>
    </div >
  </>
}

DrawControl.defaultProps = {
  onCreate: () => { },
  onUpdate: () => { },
  onDelete: () => { }
}
