function App() {
  function onClick() {
    // TODO: Remember how to write React apps
    const name = "luke";

    fetch(`${process.env.REACT_APP_API_URL}/hello/${name}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((json) => console.log(json));
  }

  return (
    <div className="App">
      <input placeholder="Your Name" type="text" />

      <button onClick={onClick}>Say Hello!</button>
    </div>
  );
}

export default App;
