import { createEvent, createStore } from "effector";

export const $modal = createStore<string | null>(null);

export const showModal = createEvent<string>();
export const closeModal = createEvent();

$modal.on(showModal, (_, payload) => payload);
$modal.on(closeModal, () => null);
