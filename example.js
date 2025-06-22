import Application from 'pishposh';

const app = new Application();
app.to("start"); // inactive → activating
console.log("State:", app.state);
