"use strict";

const GET_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";
const POST_URL = "https://jsonplaceholder.typicode.com/posts";
const loadButton = document.querySelector("#load-button");
const submitButton = document.querySelector("#submit-button");
const form = document.querySelector("#post-form");
const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const postsList = document.querySelector("#posts-list");
const createdPost = document.querySelector("#created-post");
const loadMessage = document.querySelector("#load-message");
const formMessage = document.querySelector("#form-message");

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message ${type}`;
}

function makePost(post) {
  const article = document.createElement("article");
  article.className = "post";
  const id = document.createElement("p");
  id.className = "post-id";
  id.textContent = `ID: ${post.id}`;
  const title = document.createElement("h3");
  title.textContent = post.title;
  const body = document.createElement("p");
  body.textContent = post.body;
  article.append(id, title, body);
  return article;
}

function errorText(error) {
  if (error instanceof TypeError) {
    return "Не удалось выполнить запрос. Проверьте подключение к интернету и повторите попытку.";
  }
  return `Ошибка: ${error.message}. Попробуйте ещё раз.`;
}

loadButton.addEventListener("click", async () => {
  if (loadButton.disabled) return;
  loadButton.disabled = true;
  loadButton.textContent = "Загрузка…";
  postsList.setAttribute("aria-busy", "true");
  showMessage(loadMessage, "Загрузка публикаций…", "loading");
  try {
    const response = await fetch(GET_URL);
    if (!response.ok) throw new Error(`сервер вернул HTTP ${response.status}`);
    const posts = await response.json();
    if (!Array.isArray(posts)) throw new Error("неверный формат ответа сервера");
    const fragment = document.createDocumentFragment();
    posts.forEach(post => fragment.append(makePost(post)));
    postsList.replaceChildren(fragment);
    showMessage(loadMessage, `Загружено публикаций: ${posts.length}.`, "success");
  } catch (error) {
    showMessage(loadMessage, errorText(error), "error");
  } finally {
    loadButton.disabled = false;
    loadButton.textContent = "Загрузить публикации";
    postsList.setAttribute("aria-busy", "false");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  titleInput.setAttribute("aria-invalid", String(!title));
  bodyInput.setAttribute("aria-invalid", String(!body));
  if (!title || !body) {
    showMessage(formMessage, "Заполните заголовок и текст. Поля не могут состоять только из пробелов.", "error");
    (!title ? titleInput : bodyInput).focus();
    return;
  }
  submitButton.disabled = true;
  titleInput.disabled = true;
  bodyInput.disabled = true;
  submitButton.textContent = "Отправка…";
  form.setAttribute("aria-busy", "true");
  showMessage(formMessage, "Отправка публикации…", "loading");
  try {
    const response = await fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, userId: 1 })
    });
    if (!response.ok) throw new Error(`сервер вернул HTTP ${response.status}`);
    const post = await response.json();
    if (post.id == null || typeof post.title !== "string" || typeof post.body !== "string") {
      throw new Error("неверный формат ответа сервера");
    }
    createdPost.replaceChildren(makePost(post));
    showMessage(formMessage, `Публикация успешно создана! HTTP ${response.status}. ID: ${post.id}.`, "success");
    form.reset();
  } catch (error) {
    showMessage(formMessage, errorText(error), "error");
  } finally {
    submitButton.disabled = false;
    titleInput.disabled = false;
    bodyInput.disabled = false;
    submitButton.textContent = "Создать публикацию";
    form.setAttribute("aria-busy", "false");
  }
});
