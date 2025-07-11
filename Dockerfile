# Використовуємо офіційний Node.js образ
FROM node:18

# Встановлюємо робочу директорію у контейнері
WORKDIR /app

# Копіюємо package.json і package-lock.json для встановлення залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь код проекту в контейнер
COPY . .

# В exposed 3000 порт, оскільки він зазначений у .env.development
EXPOSE 3000

# Встановлюємо стандартну команду для запуску
CMD ["npm", "start"]