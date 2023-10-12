import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { useControl } from 'react-map-gl'

export function DrawControl (props) {
  useControl(
    () => new MapboxDraw(props),
    ({ map }) => {
      map.on('draw.create', props.onCreate)
      map.on('draw.update', props.onUpdate)
      map.on('draw.delete', props.onDelete)
    },
    ({ map }) => {
      map.off('draw.create', props.onCreate)
      map.off('draw.update', props.onUpdate)
      map.off('draw.delete', props.onDelete)
    },
    {
      position: props.position
    }
  )

  return null
}

DrawControl.defaultProps = {
  onCreate: () => {},
  onUpdate: () => {},
  onDelete: () => {}
}
