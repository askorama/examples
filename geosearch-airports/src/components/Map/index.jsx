import { useState, useCallback, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl'
import { search } from '@orama/orama'
import { FaLocationPin } from 'react-icons/fa6'
import { orama } from '../../lib/orama'
import { DrawControl } from '../DrawControl'
import 'mapbox-gl/dist/mapbox-gl.css'

export function OramaMap ({ onPolygonChange }) {
  const [polygon, setPolygon] = useState({})
  const [searchResults, setSearchResults] = useState()

  const onUpdate = useCallback(e => {
    setPolygon(currPolygon => {
      const newPolygon = { ...currPolygon }
      for (const point of e.features) {
        newPolygon[point.id] = point
      }
      return newPolygon
    })
  }, [])

  useEffect(() => {
    const shape = Object.values(polygon).shift()

    if (shape) {
      const coordinates = []

      for (const point of shape.geometry.coordinates[0]) {
        coordinates.push({ lat: point[1], lon: point[0] })
      }

      search(orama, {
        limit: 10_000,
        where: {
          location: {
            polygon: {
              coordinates
            }
          }
        }
      })
        .then((data) => {
          setSearchResults(data)
          onPolygonChange(searchResults)
        })
        .catch(console.error)
    }
  }, [polygon])

  const onDelete = useCallback(e => {
    setPolygon(currPolygon => {
      const newPolygon = { ...currPolygon }
      for (const point of e.features) {
        delete newPolygon[point.id]
      }
      return newPolygon
    })
  }, [])

  const pins = searchResults?.hits?.map((hit) => (
    <Marker
      key={hit.id}
      longitude={hit.document.location.lon}
      latitude={hit.document.location.lat}
      onClick={(e) => {
        e.originalEvent.stopPropagation()
      }}
    >
      <FaLocationPin className='w-6 h-6 text-red-500' />
    </Marker>
  ))

  return (
    <Map
      mapLib={import('mapbox-gl')}
      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      initialViewState={{
        latitude: 40,
        longitude: -100,
        zoom: 3.5,
        bearing: 0,
        pitch: 0
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle='mapbox://styles/mapbox/dark-v9'
    >
      <DrawControl
        // position='top-left'
        displayControlsDefault={false}
        controls={{
          polygon: true,
          trash: true,
        }}
        defaultMode='draw_polygon'
        onCreate={onUpdate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
      {pins}
    </Map>
  )
}
