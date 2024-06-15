import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // Requires a loader
import { Carousel } from 'react-responsive-carousel';
import './App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons'; // Import the specific icon you need

import tokens from './tokens.json';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [showTranscription, setShowTranscription] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [summaryText, setSummaryText] = useState('');
  const [error, setError] = useState('');

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
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });
      setResults(response.data.episodes.items.map(item => ({
        url: item.images[0].url,
        description: item.description,
        language: item.language,
        name: item.name,
        releaseDate: item.release_date,
        audioPreviewUrl: item.audio_preview_url
      })));
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTranscription = async () => {
    if (selectedItemIndex === null) {
        setError('Please select an episode to transcribe.');
        return;
    }

    try {
        const response = await axios.post('http://127.0.0.1:5000/transcribe', {
            method: 'POST',
            audioPreviewUrl: results[selectedItemIndex].audioPreviewUrl,
            credentials: 'include', // This ensures that credentials (cookies, etc.) are included
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Credentials': true
          },
        }, {
            withCredentials: true  // Ensure credentials are included
        });
        const { transcription, summary } = response.data;
        setTranscriptionText(transcription);
        setSummaryText(summary);
        setShowTranscription(true);
        setError('');
    } catch (error) {
        console.error('Error fetching transcription:', error);
        setError('Error fetching transcription. Please try again.');
    }
};

  return (
    <div className="App">
      <h1>Spotify Episode Summarizer</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an episode..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {results.length > 0 && (
        <div>
          <Carousel onChange={(index) => setSelectedItemIndex(index)}>
            {results.map((result, index) => (
              <div key={index}>
                <img src={result.url} alt={`Result ${index}`} />
              </div>
            ))}
          </Carousel>
          <div className="details">
            {selectedItemIndex !== null && (
              <div className="episode-details">
                <h2>{results[selectedItemIndex].name}</h2>
                <p><strong>Description:</strong> {results[selectedItemIndex].description}</p>
                <p><strong>Language:</strong> {results[selectedItemIndex].language}</p>
                <p><strong>Release Date:</strong> {results[selectedItemIndex].releaseDate}</p>
                {results[selectedItemIndex].audioPreviewUrl && (
                  <p><strong>Audio Preview:</strong> <a href={results[selectedItemIndex].audioPreviewUrl} target="_blank" rel="noopener noreferrer">Listen</a></p>
                )}
              </div>
            )}
          </div>
          <button onClick={toggleTranscription} className="transcription-button">
            Get Transcription
          </button>
          {showTranscription && (
            <div className="transcription-bubble">
              <p>{transcriptionText}</p>
              <p><strong>Summary:</strong> {summaryText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
