[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]

<a name="readme-top"></a>
<br />
<div align="center">
  <a href="https://live-chat-goubs.fly.dev/">
    <img src="https://livechat.design/images/livechat/DIGITAL%20%28RGB%29/PNG/Stacked_RGB_Black.png" alt="Logo" width="90" height="80">
  </a>

  <h3 align="center">Live Chat</h3>

  <p align="center">
    <i>Who wants to use facebook anymore..</i>
    <br />
    <a href="https://live-chat-goubs.fly.dev/"><strong>Visit »</strong></a>
    <br />
    <br />
    <a href="https://github.com/VictorGoubet/LiveChat/issues">Report Bug</a>
    •
    <a href="https://github.com/VictorGoubet/LiveChat/issues">Request Feature</a>
  </p>
</div>


## About The Project
</br>

What could be easier than a web chat? We use it every day to exchange messages, photos, news or even confidential information. But do we really trust them? Do we really know what's behind it, where our data goes, how it transits and could we easily reimplement this everyday technology? 

That's the goal of this project, let's do it!

[![Product Name Screen Shot][product-screenshot]](screenshot.PNG)



<p align="right"><a href="#readme-top">🔝</a></p>


## Implementation

<br>

### About API

<br>

The architecture of a web chat is pretty simple. First you will have the backend server. You will find two types of handled requests. First, the classic rest api requests. These one will be used for login, registeration, getting the number of users and so on. The second type is socket.io events. You can see it as a biderectionnal tunnel. Indeed, in the classic pattern you would have a client calling a server and getting a response. Here, the client can send but also receive a response. It's really like a human conversation, each entity speaking but also listening to the other. This type of protocol is perfect then for a web chat!

For the front part, nothing crazy: just a react app with routers for the differents pages.

<br>

### About authentication

<br>

The new trends is about MFA, and one of the used tier is google authenticator. I thought that it could be fun to take part of this technology to avoid to remember all the time its password but just to have to give its username and the time-generated token from google authenticator. 

You can see here the workflow of google authenticator extracted from this nice [twit](https://twitter.com/alexxubyte/status/1549781763999744000).
<center>
<br>
<img src="https://pbs.twimg.com/media/FYHuTB0VUAMTGI0?format=jpg&name=4096x4096" alt="Google Authenticator archi" width="400">
</center>

<br>

### And for the storage ?

<br>

Users and messages are store in mongo DB. A nice improvment would be to integrate E2E encryption which is discussed for example in [this](https://www.youtube.com/watch?v=jkV1KEJGKRA&ab_channel=Computerphile) great video from computerphile. 

<br>

### Conclusion

<br>

Web chat are simple! Even a baby (or chatgpt) could create a live chat nowadays. The challenge is not about the architecture and the technologies used in these applications but about the governance and the security of the data. The question is not, "is this app working?" but "is this app secured". We saw that E2E protocols can help to provide a good level of encryption, but keep in mind that even if the system can't tell what do you speak about, he knows that you, the user 07900978 sent 11 messages to the user 0909809 at 9pm. The usage metrics are often the time more precious than the last story of when you were drunk. 

<p align="right"><a href="#readme-top">🔝</a></p>

## Getting Started

You can directly go on the [webapp](https://live-chat-goubs.fly.dev/), but if you want, you can execute locally the project.

### Prerequisites

You will just need a recent version of node.

  ```sh
  > node -v
  > v18.12.1
  ```

### Installation

You can follow the different steps inorder to get the app working on your computer


1. Clone the repo

   ```sh
   git clone https://github.com/VictorGoubet/LiveChat.git
   ```

2. Install packages. (It will install required packages from front and back)

   ```sh
   npm run build
   ```

3. Launch the server

   ```sh
   npm start
   ```

4. Go to **localhost:5000** in a browser

5. Try it yourself! 



<p align="right"><a href="#readme-top">🔝</a></p>





<!-- CONTACT -->
-----
</br>

[![LinkedIn][linkedin-shield]][linkedin-url]
</br>
Victor Goubet - victorgoubet@orange.fr  



<!-- MARKDOWN LINKS & IMAGES -->
[forks-shield]: https://img.shields.io/github/forks/VictorGoubet/LiveChat.svg?style=for-the-badge
[forks-url]: https://github.com/VictorGoubet/LiveChat/network/members
[stars-shield]: https://img.shields.io/github/stars/VictorGoubet/LiveChat.svg?style=for-the-badge
[stars-url]: https://img.shields.io/github/issues/VictorGoubet/LiveChat/stargazers
[issues-shield]: https://img.shields.io/github/issues/VictorGoubet/LiveChat.svg?style=for-the-badge
[issues-url]: https://github.com/VictorGoubet/LiveChat/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/victorgoubet/
[product-screenshot]: screenshot.PNG
[minmax-screenshot]: MinMax.jpg