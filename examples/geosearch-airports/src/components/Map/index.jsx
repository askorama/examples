import { useState, useEffect, useMemo } from 'react'
import Map, { Marker } from 'react-map-gl'
import { search } from '@orama/orama'
import { FaLocationPin } from 'react-icons/fa6'
import { orama } from '../../lib/orama'
import { DrawControl } from '../DrawControl'

const VITE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

if (!VITE_MAPBOX_TOKEN) {
  throw Error('VITE_MAPBOX_TOKEN not set in .env file')
}

export function OramaMap({ onPolygonChange }) {
  const [polygons, setPolygons] = useState({})
  const [uniqueLocations, setUniqueLocations] = useState([])

  useEffect(() => {
    const polygonIds = Object.keys(polygons)

    const oramaPromises = []

    for (const id of polygonIds) {
      const polygon = polygons[id]
      const coordinates = []

      if (!polygon.geometry.coordinates || !polygon.geometry.coordinates[0]) {
        return
      }

      for (const point of polygon.geometry.coordinates[0]) {
        coordinates.push({ lat: point[1], lon: point[0] })
      }

      oramaPromises.push(search(orama, {
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
          if (!data || !data.hits) {
            return
          }

          return { id: polygon.id, hits: data.hits }
        })
        .catch(console.error))

    }

    // Finally update the search results for all polygons
    Promise.all(oramaPromises).then((results) => {
      const newSearchResults = {}
      results.forEach((result) => {
        if (!result) {
          return
        }
        newSearchResults[result.id] = result.hits
      })

      const uniqueLocationIds = new Set()
      const uniqueLocations = []

      // Ensure that locations aren't added twice as this will throw an error
      Object.keys(newSearchResults).forEach((polygonId) => {
        newSearchResults[polygonId].forEach((location) => {
          if (!uniqueLocationIds.has(location)) {
            uniqueLocationIds.add(location.id)
            uniqueLocations.push(location)
          }
        })
      })

      onPolygonChange(uniqueLocations)
      setUniqueLocations(uniqueLocations)
    })

  }, [polygons])


  const pinMarkers = useMemo(() => {
    if (!uniqueLocations || uniqueLocations.length === 0) {
      return []
    }

    return uniqueLocations.map((hit) => (
      <Marker
        key={hit.id}
        longitude={hit.document.location.lon}
        latitude={hit.document.location.lat}
        onClick={(e) => {
          e.originalEvent.stopPropagation()
        }}
      >
        <FaLocationPin className='w-6 h-6 text-violet-500' />
      </Marker>))
  }, [uniqueLocations])

  return <>
    <Map
      mapLib={import('mapbox-gl')}
      mapboxAccessToken={VITE_MAPBOX_TOKEN}
      initialViewState={{
        latitude: 40,
        longitude: -100,
        zoom: 3.5,
        bearing: 0,
        pitch: 0
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle='mapbox://styles/mapbox/dark-v9'
    >
      <DrawControl
        onCreate={(polygon) => {
          setPolygons({
            ...polygons,
            [polygon.id]: polygon
          })
        }}
        onUpdate={(polygon) => {
          setPolygons({
            ...polygons,
            [polygon.id]: polygon
          })
        }}
        onDelete={(deletedIds) => {
          setPolygons((currentPolygons) => {

            const newPolygons = {}
            Object.keys(currentPolygons).forEach((polygonId) => {
              if (!deletedIds.includes(polygonId)) {
                newPolygons[polygonId] = currentPolygons[polygonId]
              }
            })

            return newPolygons
          })
        }}
      />
      {pinMarkers}
    </Map>
  </>
}
