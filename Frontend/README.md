# React + Vite

## Running the scheduling feature

Start the services in separate terminals:

1. Start the Python scheduler from `scheduler` with
   `.\venv\Scripts\Activate.ps1` and
   `uvicorn app.main:app --reload --port 8001`.
2. Start the Node API from `Backend` with `npm run dev`.
3. Start this frontend with `npm run dev`, then sign in and open **Timetable**.

The timetable page calls the authenticated Node endpoint at
`POST /api/scheduling/generate`. The Node API forwards the request to the
scheduler at `http://localhost:8001` by default. Set `SCHEDULER_URL` in the
backend environment if the scheduler runs elsewhere. The response includes
the generated session assignments and is rendered in the timetable grid.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
