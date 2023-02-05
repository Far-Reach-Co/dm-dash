let state = {
  config: {
    // serverURL: 'http://localhost:4000'
    serverURL: "http://localhost:4000",
    queryLimit: 10,
    queryOffset: 10,
  }
};

if (history.state && history.state.applicationState) {
  state = history.state.applicationState;
}

export default state;
