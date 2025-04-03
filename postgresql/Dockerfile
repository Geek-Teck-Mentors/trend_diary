FROM postgres:latest

# localeをja_JP.UTF-8に設定するために日本語のロケールをインストール
RUN apt-get update \
    && apt-get install -y locales

RUN localedef -i ja_JP -c -f UTF-8 ja_JP.UTF-8

ENV LANG ja_JP.UTF-8
