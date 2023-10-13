import { useState } from 'react'
import clx from 'classnames'
import { OramaMap } from './components/Map'

function App () {
  const [searchResults, setSearchResults] = useState()

  return (
    <>
      <div className='w-full min-h-screen bg-zinc-950  text-zinc-50'>

        <div className='w-full min-h-screen'>
          <OramaMap onPolygonChange={setSearchResults} />
        </div>

        <div className='absolute top-0 left-0 h-full border-r border-[#37343C] bg-[#28233299] p-8 w-96 backdrop-blur-md shadow-black shadow-2xl'>
          <a href='https://oramasearch.com' target='_blank'>
            <img src='/orama-geosearch.svg' className='w-48' />
          </a>
          <h1 className='text-2xl font-bold mt-8'> Airports </h1>
          <div className='text-sm text-neutral-400'>
            {
              searchResults
                ? <div> {searchResults?.count ?? 0} results in {searchResults?.elapsed?.formatted} </div>
                : <div> No results </div>
            }
          </div>
          <div>
            <ul className='mt-8 text-sm w-full h-96 overflow-scroll'>
              {searchResults?.hits?.map((hit, i) => (
                <li
                  key={hit.id} className='rounded-md mb-2 px-2 py-1 bg-[#342F43]'
                >
                  <div className='font-bold'>
                    {hit.document.iata} - {hit.document.city}
                  </div>
                  <div className='text-neutral-400'>
                    {hit.document.country}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
