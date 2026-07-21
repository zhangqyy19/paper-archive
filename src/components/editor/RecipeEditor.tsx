import { useEffect, useRef, useState } from 'react'
import type { Entry, RecipeData, RecipeMedia } from '@/models/types'
import { useAutoSave, type SaveStatus } from '@/lib/useAutoSave'
import {
  formatDate,
  formatFractions,
  hostLabel,
  toVideoEmbedUrl,
  uid,
} from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { RichToolbar } from './RichToolbar'
import './Editor.css'
import './RecipeEditor.css'

interface RecipeEditorProps {
  entry: Entry
  onSave: (patch: {
    title: string
    content: string
    recipe: RecipeData
  }) => Promise<void> | void
}

function StatusLabel({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return <span className="editor__status">Saving…</span>
    case 'saved':
      return (
        <span className="editor__status is-saved">
          <Icon name="check" size={14} /> Saved
        </span>
      )
    case 'error':
      return <span className="editor__status is-error">Couldn’t save</span>
    default:
      return <span className="editor__status is-idle">All changes saved</span>
  }
}

/** Seed a contentEditable area, treating legacy plain text safely. */
function seedHtml(el: HTMLDivElement | null, raw: string) {
  if (!el) return
  el.innerHTML = raw ?? ''
}

export function RecipeEditor({ entry, onSave }: RecipeEditorProps) {
  const base: RecipeData = entry.recipe ?? {
    ingredients: '',
    instructions: '',
    media: [],
  }

  const [title, setTitle] = useState(entry.title)
  const [ingredients, setIngredients] = useState(base.ingredients)
  const [instructions, setInstructions] = useState(base.instructions)
  const [media, setMedia] = useState<RecipeMedia[]>(base.media ?? [])
  const [servings, setServings] = useState(base.servings ?? '')
  const [prepTime, setPrepTime] = useState(base.prepTime ?? '')
  const [cookTime, setCookTime] = useState(base.cookTime ?? '')

  const ingRef = useRef<HTMLDivElement>(null)
  const insRef = useRef<HTMLDivElement>(null)
  // Which editable area last held the caret — the toolbar acts on this one.
  const focusedRef = useRef<HTMLDivElement | null>(null)

  const [showMediaForm, setShowMediaForm] = useState(false)
  const [mediaKind, setMediaKind] = useState<'video' | 'link'>('video')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaLabel, setMediaLabel] = useState('')

  // Re-seed both areas and reset local state when the entry changes.
  useEffect(() => {
    const r = entry.recipe ?? { ingredients: '', instructions: '', media: [] }
    setTitle(entry.title)
    setIngredients(r.ingredients)
    setInstructions(r.instructions)
    setMedia(r.media ?? [])
    setServings(r.servings ?? '')
    setPrepTime(r.prepTime ?? '')
    setCookTime(r.cookTime ?? '')
   seedHtml(ingRef.current, r.ingredients)
    seedHtml(insRef.current, r.instructions)
  }, [entry.id])

  const { status } = useAutoSave({
    value: {
      title,
      content: entry.content,
      recipe: {
        ingredients,
        instructions,
        media,
        servings: servings || undefined,
        prepTime: prepTime || undefined,
        cookTime: cookTime || undefined,
        sourceUrl: base.sourceUrl,
      },
    },
    onSave,
    delay: 700,
  })

  const syncIngredients = () => {
    if (ingRef.current) setIngredients(ingRef.current.innerHTML)
  }
  const syncInstructions = () => {
    if (insRef.current) setInstructions(insRef.current.innerHTML)
  }

  // Format "3/4" style fractions in place. Runs on blur (safe: caret already
  // gone) and after typing a separator like space/enter (caret restored to end
  // so the user can keep typing seamlessly).
  const applyFractions = (restoreCaret = false) => {
    const el = ingRef.current
    if (!el) return
    const formatted = formatFractions(el.innerHTML)
    if (formatted === el.innerHTML) return
    el.innerHTML = formatted
    setIngredients(formatted)
    if (restoreCaret) {
      // Place the caret at the very end of the ingredients area.
      const sel = window.getSelection()
      if (sel) {
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }

  const onIngredientsKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // A fraction becomes "complete" once a boundary char is typed after it.
    if (e.key === ' ' || e.key === 'Enter') applyFractions(true)
  }

  const addMedia = () => {
    const url = mediaUrl.trim()
    if (!url) return
    if (mediaKind === 'video' && !toVideoEmbedUrl(url)) return
    const item: RecipeMedia = {
      id: uid(),
      kind: mediaKind,
      url,
      label: mediaLabel.trim() || undefined,
    }
    setMedia((prev) => [...prev, item])
    setMediaUrl('')
    setMediaLabel('')
    setShowMediaForm(false)
  }

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="editor recipe">
      <div className="editor__bar">
        <span className="editor__date">{formatDate(entry.updatedAt)}</span>
        <StatusLabel status={status} />
      </div>

      <RichToolbar
        onCommand={() => {
          syncIngredients()
          syncInstructions()
        }}
        getEditor={() => focusedRef.current ?? insRef.current}
      />

      <div className="editor__paper recipe__paper">
        <input
          className="editor__title"
          value={title}
          onChange={(e) =>setTitle(e.target.value)}
          placeholder="Recipe name"
          aria-label="Recipe name"
        />

        <div className="recipe__meta">
          <label className="recipe__meta-field">
            <Icon name="users" size={15} />
            <input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="Servings"
              aria-label="Servings"
            />
          </label>
          <label className="recipe__meta-field">
            <Icon name="clock" size={15} />
            <input
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="Prep time"
              aria-label="Prep time"
            />
          </label>
          <label className="recipe__meta-field">
            <Icon name="clock" size={15} />
            <input
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="Cook time"
              aria-label="Cook time"
            />
          </label>
        </div>

        <section className="recipe__section">
          <h2 className="recipe__heading">Ingredients</h2>
          <div
            ref={ingRef}
            className="editor__content recipe__field recipe__ingredients"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Ingredients"
            data-placeholder="One ingredient per line"
            onFocus={() => (focusedRef.current = ingRef.current)}
            onInput={syncIngredients}
            onKeyUp={onIngredientsKeyUp}
            onBlur={() => applyFractions(false)}
          />
        </section>

        <section className="recipe__section">
          <h2 className="recipe__heading">Preparation</h2>
          <div
            ref={insRef}
            className="editor__content recipe__field recipe__instructions"
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label="Preparation instructions"
            data-placeholder="Step by step…"
            onFocus={() => (focusedRef.current = insRef.current)}
            onInput={syncInstructions}
          />
        </section>

        <section className="recipe__section">
          <div className="recipe__media-head">
            <h2 className="recipe__heading">Video & links</h2>
            <button
              type="button"
              className="recipe__add"
              onClick={() => setShowMediaForm((v) => !v)}
            >
              <Icon name="plus" size={15} /> Add
            </button>
          </div>

       {showMediaForm && (
            <div className="recipe__media-form">
              <div className="recipe__kind-toggle">
                <button
                  type="button"
                  className={mediaKind === 'video' ? 'is-active' : ''}
                  onClick={() => setMediaKind('video')}
               >
                  <Icon name="video" size={15} /> Video
                </button>
                <button
                  type="button"
                  className={mediaKind === 'link' ? 'is-active' : ''}
                  onClick={() => setMediaKind('link')}
                >
                  <Icon name="link" size={15} /> Link
                </button>
              </div>
              <input
                className="recipe__media-input"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={
                  mediaKind === 'video'
                    ? 'YouTube / Vimeo / video URL'
                    : 'https://…'
                }
                aria-label="Media URL"
              />
              {mediaKind === 'link' && (
                <input
                  className="recipe__media-input"
                  value={mediaLabel}
                  onChange={(e) => setMediaLabel(e.target.value)}
                  placeholder="Label (optional)"
                  aria-label="Link label"
                />
              )}
              <button
                type="button"
                className="recipe__media-save"
                onClick={addMedia}
              >
                Add
              </button>
            </div>
          )}

          <div className="recipe__media-list">
            {media.map((m) => (
              <MediaCard key={m.id} media={m} onRemove={() => removeMedia(m.id)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function MediaCard({
  media,
  onRemove,
}: {
  media: RecipeMedia
  onRemove: () => void
}) {
  if (media.kind === 'video') {
    const src = toVideoEmbedUrl(media.url)
    return (
      <div className="recipe__media-card">
        <button
          type="button"
          className="recipe__media-remove"
          onClick={onRemove}
          aria-label="Remove video"
        >
          <Icon name="close" size={14} />
        </button>
        {src ? (
          <div className="recipe__video">
            <iframe
              src={src}
              title={media.label || 'Recipe video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a href={media.url} target="_blank" rel="noreferrer">
            {media.url}
          </a>
        )}
      </div>
    )
  }
  return (
    <div className="recipe__media-card recipe__media-card--link">
      <a
        className="recipe__link"
        href={media.url}
        target="_blank"
        rel="noreferrer"
      >
        <Icon name="link" size={16} />
    <span>{media.label || hostLabel(media.url)}</span>
      </a>
      <button
        type="button"
        className="recipe__media-remove"
        onClick={onRemove}
        aria-label="Remove link"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  )
}