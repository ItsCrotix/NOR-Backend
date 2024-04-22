let serverStatus;
let isActive = false;

const subscribeToServerStatus = async () => {
  isActive = true;
  while (isActive) {
    await pollACCServer();
    await new Promise((resolve) => setTimeout(resolve, 30000));
  }
};

const unSubscribeToServerStatus = () => {
  isActive = false;
};

const pollACCServer = async () => {
  const request = await fetch(
    "https://acc-status.jonatan.net/api/v2/acc/status"
  );
  const response = await request.json();
  serverStatus = response;
};

export default subscribeToServerStatus;
export { serverStatus };
