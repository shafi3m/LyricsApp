import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-XXXXXXXXXX"; // 🔁 Replace this with your actual Measurement ID from Google Analytics

export const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
