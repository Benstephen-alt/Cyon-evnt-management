

import { Router } from "express";
import * as draftController from "./draft.controller";
import { authenticate, } from  "@/shared/utils/middlewares/auth.middleware";
import { authorize } from "@/shared/utils/middlewares/role.middleware";



const router = Router();

router.use(authenticate);

router.use(authorize("PARISH"));

router.post("/current", draftController.createDraft);

router.get("/current", draftController.getDrafts);

router.put("/current", draftController.updateCurrentDraft);

router.delete("/current", draftController.deleteCurrentDraft);

router.post(
    "/current/submit",
    draftController.submitCurrentDraftController
);





export default router;