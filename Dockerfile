# frontend/Dockerfile
FROM mcr.microsoft.com/windows/servercore:ltsc2022 AS builder

WORKDIR C:/app

# Instalar Node.js
ADD https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi node.msi
RUN start /wait msiexec /i node.msi /quiet /qn /norestart INSTALLDIR=C:\\nodejs && \
    del node.msi

ENV PATH="C:\nodejs;%PATH%"

COPY package*.json ./
RUN npm install
COPY . .

FROM mcr.microsoft.com/windows/nanoserver:ltsc2022 AS runtime

WORKDIR C:/app

COPY --from=builder C:/nodejs C:/nodejs
COPY --from=builder C:/app/node_modules ./node_modules
COPY --from=builder C:/app .

ENV PATH="C:\nodejs;%PATH%"

EXPOSE 5173
CMD ["C:\\nodejs\\npm.cmd", "run", "dev", "--", "--host", "0.0.0.0"]