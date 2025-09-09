const cron = require("node-cron")

const GazeService = require("../service/GazeService")

cron.schedule('0 0 * * *', () => {
    GazeService.getAllByNth(0);
})