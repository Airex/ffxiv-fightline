#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/sdk:5.0 as node

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1

# install NodeJS 13.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq && apt-get install curl gnupg -yq 
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

FROM  node as build
WORKDIR /app

COPY . .
RUN dotnet publish ./FightTimeLine.csproj -c Release -o /webhost

FROM mcr.microsoft.com/dotnet/aspnet:5.0
WORKDIR /app
COPY --from=build /webhost .

EXPOSE 80

ENTRYPOINT ["dotnet", "FightTimeLine.dll"]