import Main from "./components/assemblyEndgame/main";

function App() {
  return (
    <>
      <div className="desktop-warning">
        Sorry! Desktop mode not available for this web app yet, resize your
        screen to a width of <strong>&lt;= 632px</strong>
      </div>
      <Main />
    </>
  );
}

export default App;
