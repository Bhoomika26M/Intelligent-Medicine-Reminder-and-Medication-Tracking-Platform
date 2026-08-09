from rapidfuzz import process
from .medicine_master import MEDICINE_MASTER


def correct_medicine_name(name):
    """
    Correct medicine spelling using RapidFuzz.
    """

    if not name:
        return name

    match = process.extractOne(
        name,
        MEDICINE_MASTER,
        score_cutoff=80
    )

    if match:
        return match[0]

    return name


def correct_medicines(medicines):
    """
    Correct all medicine names.
    """

    corrected = []

    for medicine in medicines:

        medicine["medicine_name"] = correct_medicine_name(
            medicine.get("medicine_name", "")
        )

        corrected.append(medicine)

    return corrected