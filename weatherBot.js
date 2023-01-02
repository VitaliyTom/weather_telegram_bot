require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const weather = require('openweather-apis');

const bot = new Telegraf(process.env.WEATHER_BOT_TOKEN);
bot.start((ctx) => {
  return ctx.reply(
    `Привет ${ctx.update.message.from.first_name} 👋
Что бы узнать погоду на сегодня - нажмите на кнопку с названием населенного пункта, либо напишите его`,
    Markup.keyboard([
      ['Минск', 'Пинск'],
      ['Гданьск', 'Зацень'],
    ])
      .resize()
      .placeholder('Введите населенный пункт... ')
  );
});

bot.on('text', (ctx) => {
  weather.setLang('ru');
  weather.setCity(ctx.message.text);
  weather.setUnits('metric');
  // check http://openweathermap.org/appid#get for get the APPID
  weather.setAPPID(process.env.OPEN_WEATHER_TOKEN);
  weather.getAllWeather(function (err, JSONObj) {
    if (!err) {
      const {
        name,
        weather,
        main: { temp, temp_max, temp_min, feels_like, pressure, humidity },
        wind: { speed },
        sys: { country },
      } = JSONObj;

      ctx.replyWithHTML(`
<i>Страна</i>: <b> ${country}</b>
<i>Город:</i> <b> ${name}</b>
<i>Описание:</i> <b> ${weather.map(({ description }) =>
        description.replace(description[0], description[0].toUpperCase())
      )}</b>
<i>Температура:</i> <b> ${Math.round(temp)} °C </b>
<i>Макс. темп.:</i> <b> ${Math.round(temp_max)} °C </b>
<i>Мин. темп.:</i> <b> ${Math.round(temp_min)} °C </b>
<i>Чувствуется как:</i> <b> ${Math.round(feels_like)} °C </b>
<i>Давление:</i> <b> ${pressure} мм рт.ст. </b>
<i>Влажность:</i> <b> ${humidity} % </b>
<i>Ветер:</i> <b> ${Math.round(speed)} м/с </b>
        `);
    } else ctx.reply(`Город не найден... 😟`);
  });
});

bot.launch();

console.log('bot started...');
