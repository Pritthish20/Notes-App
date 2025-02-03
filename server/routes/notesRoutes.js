import { Router } from 'express';

import {createNote,updateNote,getAllNotes,specificNote,deleteNote, favourites } from '../controllers/notesControllers.js'
import {auth} from '../middlewares/authMiddleware.js'

const router= Router();

router.get('/all',auth,getAllNotes);
router.get('/fav',auth,favourites);
router.route('/:id').get(auth,specificNote).put(auth,updateNote).delete(auth,deleteNote);
router.post('/new',auth,createNote);


export default router