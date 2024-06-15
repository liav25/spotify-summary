import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Requires a loader
import { Carousel } from 'react-responsive-carousel';
import './App.css';
import authData from './backend/spotify_token.json'; // Import the JSON file with the authorization key
import axios from 'axios';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        params: {
          q: query,
          type: 'episode',
          market: 'IL',
          include_external: 'audio'
        },
        headers: {
          'Authorization': `Bearer ${authData.access_token}`
        }
      });
      setResults(response.data.episodes.items.map(item => ({ url: item.images[0].url })));
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Spotify Episode Summarizer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an episode..."
        />
        <button type="submit">Submit</button>
      </form>
      {loading && <p>Loading...</p>}
      {results.length > 0 && (
        <Carousel showThumbs={false} showStatus={false}>
          {results.map((result, index) => (
            <div key={index}>
              <img src={result.url} alt={`Result ${index}`} />
            </div>
          ))}
        </Carousel>
      )}
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.querySelector('#root'));